import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  CircleStop,
  Clock,
  Flag,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { QuestionCard } from '@/components/QuestionCard'
import { useToast } from '@/components/ui/Toast'
import { formatDuration } from '@/lib/scoring'
import type {
  Answer,
  Candidate,
  Choice,
  InterviewMode,
  Question,
} from '@/lib/types'

interface InterviewScreenProps {
  questions: Question[]
  candidate: Candidate
  mode: InterviewMode
  startedAt: number
  onFinish: (answers: Answer[], finishedAt: number) => void
  onCancel: () => void
}

export function InterviewScreen({
  questions,
  candidate,
  mode,
  startedAt,
  onFinish,
  onCancel,
}: InterviewScreenProps) {
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map((q) => ({ qid: q.qid, choice: null })),
  )
  const [confirmed, setConfirmed] = useState<boolean[]>(
    questions.map(() => false),
  )
  const [index, setIndex] = useState(0)
  const [now, setNow] = useState<number>(Date.now())
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false)

  const toast = useToast()

  // Tick timer every second
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const question = questions[index]
  const total = questions.length
  const selected = answers[index]?.choice ?? null
  const isConfirmed = confirmed[index]

  const answeredCount = useMemo(
    () => confirmed.filter(Boolean).length,
    [confirmed],
  )

  const handleSelect = (c: Choice) => {
    if (isConfirmed) return
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, choice: c } : a)),
    )
  }

  const handleConfirm = () => {
    if (selected === null) {
      toast.push({
        tone: 'warning',
        title: 'ยังไม่ได้เลือกคำตอบ',
        message: 'กรุณาเลือก A/B/C/D ก่อนยืนยัน',
      })
      return
    }
    setConfirmed((prev) => prev.map((v, i) => (i === index ? true : v)))
  }

  const goNext = () => {
    if (index < total - 1) {
      setIndex(index + 1)
    } else {
      maybeFinish()
    }
  }

  const goPrev = () => {
    if (mode !== 'review') return
    if (index > 0) setIndex(index - 1)
  }

  const allConfirmed = confirmed.every(Boolean)

  const maybeFinish = () => {
    if (!allConfirmed) {
      setConfirmFinishOpen(true)
      return
    }
    onFinish(answers, Date.now())
  }

  const elapsed = now - startedAt

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate">
                {candidate.fullName || 'ผู้สมัคร'}
              </CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                <Badge tone={mode === 'live' ? 'berry' : 'green'}>
                  {mode === 'live' ? 'Live Mode' : 'Review Mode'}
                </Badge>
                <span>·</span>
                <span>{candidate.position}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm font-mono text-ink-700">
              <Clock className="h-4 w-4 text-berry-600" />
              {formatDuration(elapsed)}
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-ink-400">
              <span>
                ข้อ {index + 1} / {total} · {question?.section}
              </span>
              <span>ตอบแล้ว {answeredCount} / {total}</span>
            </div>
            <Progress value={index + (isConfirmed ? 1 : 0)} max={total} />
          </div>
        </CardHeader>
      </Card>

      {question ? (
        <QuestionCard
          question={question}
          index={index}
          total={total}
          selected={selected}
          confirmed={isConfirmed}
          mode={mode}
          onSelect={handleSelect}
        />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={mode !== 'review' || index === 0}
            title={
              mode !== 'review'
                ? 'Live Mode ไม่สามารถย้อนกลับได้'
                : 'ข้อก่อนหน้า'
            }
          >
            <ArrowLeft className="h-4 w-4" />
            ก่อนหน้า
          </Button>
          <Button variant="ghost" onClick={onCancel} size="sm">
            <CircleStop className="h-4 w-4" />
            ออกจากการสัมภาษณ์
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isConfirmed ? (
            <Button onClick={handleConfirm} disabled={selected === null}>
              <CheckCheck className="h-4 w-4" />
              ยืนยันคำตอบ
            </Button>
          ) : index < total - 1 ? (
            <Button onClick={goNext} variant="primary">
              ถัดไป
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={maybeFinish} variant="gold">
              <Flag className="h-4 w-4" />
              จบการสัมภาษณ์
            </Button>
          )}
        </div>
      </div>

      {confirmFinishOpen ? (
        <ConfirmFinishDialog
          remaining={total - answeredCount}
          onCancel={() => setConfirmFinishOpen(false)}
          onConfirm={() => {
            setConfirmFinishOpen(false)
            onFinish(answers, Date.now())
          }}
        />
      ) : null}
    </main>
  )
}

function ConfirmFinishDialog({
  remaining,
  onCancel,
  onConfirm,
}: {
  remaining: number
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>จบการสัมภาษณ์โดยที่ยังตอบไม่ครบ?</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert tone="warning">
            ยังเหลือ <strong>{remaining}</strong> ข้อที่ยังไม่ได้ตอบ
            ระบบจะนับเป็น “ไม่ตอบ” และไม่มีคะแนน
          </Alert>
        </CardContent>
        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onCancel}>
            กลับไปทำต่อ
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            จบการสัมภาษณ์
          </Button>
        </div>
      </Card>
    </div>
  )
}
