import { useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  FileSpreadsheet,
  PlayCircle,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/Toast'
import { parseQuestionsFile } from '@/lib/excel'
import { totalMax } from '@/lib/scoring'
import type {
  Candidate,
  InterviewMode,
  ParseError,
  Question,
} from '@/lib/types'

interface SetupScreenProps {
  initialQuestions: Question[]
  initialUsingSample: boolean
  onStart: (params: {
    questions: Question[]
    candidate: Candidate
    mode: InterviewMode
    passThreshold: number
  }) => void
}

const todayISO = (): string => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function SetupScreen({
  initialQuestions,
  initialUsingSample,
  onStart,
}: SetupScreenProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [usingSample, setUsingSample] = useState(initialUsingSample)
  const [parseErrors, setParseErrors] = useState<ParseError[]>([])
  const [parseWarnings, setParseWarnings] = useState<ParseError[]>([])
  const [parsing, setParsing] = useState(false)
  const [fileLabel, setFileLabel] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const [candidate, setCandidate] = useState<Candidate>({
    fullName: '',
    position: 'Factory Manager (Bakery)',
    interviewDate: todayISO(),
    interviewer: '',
  })
  const [mode, setMode] = useState<InterviewMode>('live')
  const [passThreshold, setPassThreshold] = useState(70)

  const sections = useMemo(() => {
    const set = new Set<string>()
    for (const q of questions) set.add(q.section)
    return Array.from(set)
  }, [questions])

  const max = useMemo(() => totalMax(questions), [questions])

  const handleFile = async (file: File) => {
    setParsing(true)
    setParseErrors([])
    setParseWarnings([])
    try {
      const result = await parseQuestionsFile(file)
      if (result.errors.length > 0) {
        setParseErrors(result.errors)
        toast.push({
          tone: 'danger',
          title: 'อ่านไฟล์ไม่สำเร็จ',
          message: `พบ ${result.errors.length} ข้อผิดพลาด — กรุณาตรวจสอบไฟล์`,
        })
        return
      }
      if (result.questions.length === 0) {
        toast.push({
          tone: 'danger',
          title: 'ไฟล์ว่าง',
          message: 'ไม่พบคำถามในไฟล์',
        })
        return
      }
      setQuestions(result.questions)
      setUsingSample(false)
      setFileLabel(file.name)
      setParseWarnings(result.warnings)
      toast.push({
        tone: 'success',
        title: 'โหลดคำถามสำเร็จ',
        message: `อ่าน ${result.questions.length} ข้อจาก ${file.name}`,
      })
    } catch (err) {
      toast.push({
        tone: 'danger',
        title: 'เกิดข้อผิดพลาด',
        message: err instanceof Error ? err.message : 'ไม่สามารถอ่านไฟล์ได้',
      })
    } finally {
      setParsing(false)
    }
  }

  const onPickFile = () => fileInputRef.current?.click()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) void handleFile(f)
    // allow reselecting the same file
    e.target.value = ''
  }

  const canStart =
    questions.length > 0 &&
    candidate.fullName.trim().length > 0 &&
    candidate.interviewer.trim().length > 0

  const handleStart = () => {
    if (!canStart) {
      toast.push({
        tone: 'warning',
        title: 'ข้อมูลยังไม่ครบ',
        message: 'กรุณากรอกชื่อผู้สมัครและผู้สัมภาษณ์ให้ครบ',
      })
      return
    }
    onStart({ questions, candidate, mode, passThreshold })
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 pb-12 sm:grid-cols-5">
      {/* Hero / Question bank card */}
      <section className="sm:col-span-3 grid gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-berry-600" />
              <CardTitle>เตรียมการสัมภาษณ์</CardTitle>
            </div>
            <CardDescription>
              คัดสรรคำถาม Multiple Choice 20 ข้อสำหรับตำแหน่ง Factory Manager
              (Bakery) ครอบคลุม Food Safety, Bakery Tech, Production Mgmt,
              Leadership, Cost & CI
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-xl border border-dashed border-cream-200 bg-cream-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-berry-100 text-berry-700">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-ink-700">
                      คลังคำถามปัจจุบัน
                    </div>
                    <div className="text-xs text-ink-400">
                      {usingSample
                        ? 'ใช้ Sample Data ที่มากับระบบ (20 ข้อ)'
                        : `อัปโหลดจากไฟล์: ${fileLabel || 'ผู้ใช้'}`}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPickFile}
                  disabled={parsing}
                >
                  <Upload className="h-4 w-4" />
                  {parsing ? 'กำลังอ่านไฟล์…' : 'อัปโหลด Excel'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
                <Stat label="คำถาม" value={`${questions.length}`} />
                <Stat label="คะแนนเต็ม" value={`${max}`} />
                <Stat label="หมวด" value={`${sections.length}`} />
                <Stat
                  label="Easy / Med / Hard"
                  value={`${count(questions, 'Easy')} / ${count(questions, 'Medium')} / ${count(questions, 'Hard')}`}
                  className="col-span-3 sm:col-span-2"
                />
              </div>
              {sections.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sections.map((s) => (
                    <Badge key={s} tone="cream">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {parseErrors.length > 0 ? (
              <Alert tone="danger" title="ข้อผิดพลาดในไฟล์">
                <ul className="ml-4 list-disc">
                  {parseErrors.slice(0, 8).map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                  {parseErrors.length > 8 ? (
                    <li>… และอีก {parseErrors.length - 8} ข้อ</li>
                  ) : null}
                </ul>
              </Alert>
            ) : null}

            {parseWarnings.length > 0 ? (
              <Alert tone="warning" title="คำเตือน">
                <ul className="ml-4 list-disc">
                  {parseWarnings.slice(0, 5).map((e, i) => (
                    <li key={i}>
                      {e.row > 0 ? `Row ${e.row}: ` : ''}
                      {e.message}
                    </li>
                  ))}
                  {parseWarnings.length > 5 ? (
                    <li>… และอีก {parseWarnings.length - 5} คำเตือน</li>
                  ) : null}
                </ul>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>โหมดการสัมภาษณ์</CardTitle>
            <CardDescription>
              เลือกโหมดที่เหมาะกับสถานการณ์การใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={mode}
              onValueChange={setMode}
              options={[
                {
                  value: 'live',
                  label: '🔵 Live Mode',
                  description:
                    'ใช้กับผู้สมัคร — ไม่เฉลยจนกว่าจะจบ ย้อนกลับไม่ได้',
                },
                {
                  value: 'review',
                  label: '🟢 Review Mode',
                  description:
                    'สำหรับฝึกซ้อม — เฉลย + คำอธิบายทันทีหลังตอบ',
                },
              ]}
            />
            <div className="mt-4 flex items-center gap-3">
              <Label className="mb-0 shrink-0">เกณฑ์ผ่าน (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passThreshold}
                onChange={(e) =>
                  setPassThreshold(
                    Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  )
                }
                className="w-24"
              />
              <span className="text-xs text-ink-400">
                ค่าเริ่มต้น 70% (ต้องได้ ≥ {passThreshold}% ถือว่าผ่าน)
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Candidate form */}
      <section className="sm:col-span-2">
        <Card className="sticky top-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-berry-600" />
              <CardTitle>ข้อมูลผู้สมัคร</CardTitle>
            </div>
            <CardDescription>กรอกก่อนเริ่มการสัมภาษณ์</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div>
              <Label>ชื่อ-นามสกุล</Label>
              <Input
                value={candidate.fullName}
                onChange={(e) =>
                  setCandidate({ ...candidate, fullName: e.target.value })
                }
                placeholder="เช่น คุณสมชาย ใจดี"
              />
            </div>
            <div>
              <Label>ตำแหน่งที่สมัคร</Label>
              <Input
                value={candidate.position}
                onChange={(e) =>
                  setCandidate({ ...candidate, position: e.target.value })
                }
              />
            </div>
            <div>
              <Label>วันที่สัมภาษณ์</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={candidate.interviewDate}
                  onChange={(e) =>
                    setCandidate({
                      ...candidate,
                      interviewDate: e.target.value,
                    })
                  }
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
              </div>
            </div>
            <div>
              <Label>ผู้สัมภาษณ์</Label>
              <Input
                value={candidate.interviewer}
                onChange={(e) =>
                  setCandidate({ ...candidate, interviewer: e.target.value })
                }
                placeholder="เช่น HR Director / Plant Director"
              />
            </div>

            <Button
              size="lg"
              className="mt-2 w-full"
              onClick={handleStart}
              disabled={!canStart}
            >
              <PlayCircle className="h-5 w-5" />
              เริ่มการสัมภาษณ์
            </Button>
            <p className="text-center text-xs text-ink-400">
              ระบบไม่เก็บข้อมูล — กดรีเฟรชจะเริ่มใหม่
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={
        'rounded-lg bg-white px-2 py-2 ring-1 ring-cream-200 ' + (className ?? '')
      }
    >
      <div className="text-base font-bold text-berry-700">{value}</div>
      <div className="text-[11px] text-ink-400">{label}</div>
    </div>
  )
}

function count(qs: Question[], d: Question['difficulty']): number {
  return qs.filter((q) => q.difficulty === d).length
}
