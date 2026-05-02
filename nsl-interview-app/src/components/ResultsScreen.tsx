import { useMemo } from 'react'
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Trophy,
  XCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { ResultChart } from '@/components/ResultChart'
import { exportResults } from '@/lib/excel'
import { formatDuration } from '@/lib/scoring'
import { useToast } from '@/components/ui/Toast'
import type { ResultSummary } from '@/lib/types'

interface ResultsScreenProps {
  result: ResultSummary
  onRestart: () => void
}

export function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const toast = useToast()

  const sortedQuestions = useMemo(
    () => [...result.questions].sort((a, b) => a.qid - b.qid),
    [result.questions],
  )

  const handleExport = () => {
    try {
      exportResults(result)
      toast.push({
        tone: 'success',
        title: 'ดาวน์โหลดสำเร็จ',
        message: 'ไฟล์ Excel ถูกบันทึกในเครื่องคุณแล้ว',
      })
    } catch (e) {
      toast.push({
        tone: 'danger',
        title: 'ดาวน์โหลดไม่สำเร็จ',
        message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด',
      })
    }
  }

  const passed = result.passed
  const percentText = `${result.percent.toFixed(1)}%`

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 pb-16">
      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="berry">{result.candidate.position}</Badge>
              <Badge tone="cream">
                สัมภาษณ์ {result.candidate.interviewDate}
              </Badge>
              <Badge tone="cream">โดย {result.candidate.interviewer}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-700 sm:text-3xl">
              {result.candidate.fullName}
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              ใช้เวลา {formatDuration(result.durationMs)} · ตอบ{' '}
              {result.answers.filter((a) => a.choice !== null).length} /{' '}
              {result.questions.length} ข้อ
            </p>
            <div className="mt-5">
              <div className="flex items-end gap-3">
                <div className="text-5xl font-extrabold leading-none text-berry-700 sm:text-6xl">
                  {result.totalScore}
                </div>
                <div className="pb-1.5 text-base text-ink-400">
                  / {result.totalMax} points · {percentText}
                </div>
              </div>
              <div className="mt-3 max-w-md">
                <Progress
                  value={result.percent}
                  max={100}
                  tone={passed ? 'green' : 'berry'}
                />
                <div className="mt-1 text-xs text-ink-400">
                  เกณฑ์ผ่าน {result.passThreshold}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-5">
            {passed ? (
              <Trophy className="h-12 w-12 text-gold-400" />
            ) : (
              <XCircle className="h-12 w-12 text-rose-500" />
            )}
            <Badge
              tone={passed ? 'green' : 'red'}
              className="px-4 py-1 text-sm"
            >
              {passed ? 'PASS' : 'FAIL'}
            </Badge>
            <div className="flex flex-col gap-2 self-stretch">
              <Button onClick={handleExport} variant="primary">
                <Download className="h-4 w-4" />
                Export ผลเป็น Excel
              </Button>
              <Button onClick={onRestart} variant="outline">
                <RefreshCw className="h-4 w-4" />
                เริ่มใหม่
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>คะแนนตามหมวด (Section Breakdown)</CardTitle>
          <CardDescription>
            เปรียบเทียบคะแนนที่ได้กับคะแนนเต็มของแต่ละหมวด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResultChart data={result.bySection} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.bySection.map((s) => {
              const pct = s.max === 0 ? 0 : (s.earned / s.max) * 100
              return (
                <div
                  key={s.section}
                  className="rounded-xl border border-cream-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-ink-700">{s.section}</div>
                    <div className="text-sm text-ink-500">
                      {s.earned}/{s.max} · {pct.toFixed(0)}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={pct}
                      max={100}
                      tone={pct >= 70 ? 'green' : pct >= 50 ? 'gold' : 'berry'}
                    />
                  </div>
                  <div className="mt-1 text-xs text-ink-400">
                    ตอบถูก {s.correctCount} / {s.count} ข้อ
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดทุกข้อ</CardTitle>
          <CardDescription>
            แสดงคำตอบของผู้สมัคร เฉลย และคำอธิบาย
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-1.5 text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-2 py-2 text-left">QID</th>
                <th className="px-2 py-2 text-left">หมวด</th>
                <th className="px-2 py-2 text-left">คำถาม</th>
                <th className="px-2 py-2 text-center">คำตอบ</th>
                <th className="px-2 py-2 text-center">เฉลย</th>
                <th className="px-2 py-2 text-center">ผล</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuestions.map((q) => {
                const a = result.answers.find((x) => x.qid === q.qid)
                const choice = a?.choice
                const ok = choice === q.correct
                return (
                  <tr
                    key={q.qid}
                    className="rounded-xl bg-cream-50/60 align-top"
                  >
                    <td className="px-2 py-2 font-mono text-xs text-ink-500">
                      {q.qid}
                    </td>
                    <td className="px-2 py-2 text-xs">
                      <Badge tone="cream">{q.section}</Badge>
                    </td>
                    <td className="px-2 py-2 text-ink-700">
                      <div className="line-clamp-2">{q.questionTH}</div>
                      <div className="mt-1 text-xs text-ink-400">
                        {q.explanationTH}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Badge tone={choice ? 'cream' : 'gray'}>
                        {choice ?? '–'}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Badge tone="green">{q.correct}</Badge>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {ok ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-rose-500" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  )
}
