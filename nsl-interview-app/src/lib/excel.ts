// Excel I/O helpers using SheetJS.
// - parseQuestionsFile: read an uploaded .xlsx with a "Questions" sheet.
// - exportResults: produce a 2-sheet workbook (Summary + Detail) and trigger download.

import * as XLSX from 'xlsx'
import type {
  Choice,
  Difficulty,
  ParseError,
  ParseResult,
  Question,
  ResultSummary,
} from './types'
import { formatDuration } from './scoring'

const REQUIRED_HEADERS = [
  'QID',
  'Section',
  'Question (TH)',
  'Choice A',
  'Choice B',
  'Choice C',
  'Choice D',
  'Correct',
  'Explanation (TH)',
  'Difficulty',
  'Weight',
] as const

type RawRow = Record<string, unknown>

function asString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function asNumber(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : fallback
}

function normalizeChoice(v: unknown): Choice | null {
  const s = asString(v).toUpperCase()
  return s === 'A' || s === 'B' || s === 'C' || s === 'D' ? s : null
}

function normalizeDifficulty(v: unknown): Difficulty {
  const s = asString(v).toLowerCase()
  if (s.startsWith('e')) return 'Easy'
  if (s.startsWith('h')) return 'Hard'
  return 'Medium'
}

function defaultWeight(d: Difficulty): number {
  return d === 'Easy' ? 1 : d === 'Hard' ? 3 : 2
}

export async function parseQuestionsFile(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'questions')
  if (!sheetName) {
    return {
      questions: [],
      errors: [
        {
          row: 0,
          message: 'ไม่พบ sheet ชื่อ "Questions" ในไฟล์ — กรุณาตรวจสอบ template',
        },
      ],
      warnings: [],
    }
  }
  const sheet = wb.Sheets[sheetName]
  const rows: RawRow[] = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' })

  const errors: ParseError[] = []
  const warnings: ParseError[] = []

  // Verify required headers exist on at least one row.
  if (rows.length > 0) {
    const headers = Object.keys(rows[0])
    const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
    if (missing.length > 0) {
      errors.push({
        row: 1,
        message: `ขาดคอลัมน์ที่จำเป็น: ${missing.join(', ')}`,
      })
      return { questions: [], errors, warnings }
    }
  }

  const questions: Question[] = []
  rows.forEach((row, idx) => {
    // sheet row number = idx + 2 (header is row 1)
    const sheetRow = idx + 2

    const qidRaw = row['QID']
    const qid = asNumber(qidRaw, NaN)
    const section = asString(row['Section'])
    const questionTH = asString(row['Question (TH)'])
    const a = asString(row['Choice A'])
    const b = asString(row['Choice B'])
    const c = asString(row['Choice C'])
    const d = asString(row['Choice D'])
    const correct = normalizeChoice(row['Correct'])
    const explanationTH = asString(row['Explanation (TH)'])
    const difficultyRaw = asString(row['Difficulty'])
    const weightRaw = row['Weight']

    if (!Number.isFinite(qid)) {
      errors.push({ row: sheetRow, message: 'QID ไม่ใช่ตัวเลข' })
      return
    }
    if (!section) {
      errors.push({ row: sheetRow, message: 'ไม่มีค่าในคอลัมน์ Section' })
      return
    }
    if (!questionTH) {
      errors.push({ row: sheetRow, message: 'ไม่มีคำถาม (Question TH)' })
      return
    }
    if (!a || !b || !c || !d) {
      errors.push({
        row: sheetRow,
        message: 'ตัวเลือก A/B/C/D ต้องไม่ว่าง',
      })
      return
    }
    if (!correct) {
      errors.push({
        row: sheetRow,
        message: 'Correct ต้องเป็น A/B/C/D เท่านั้น',
      })
      return
    }

    const difficulty = difficultyRaw
      ? normalizeDifficulty(difficultyRaw)
      : 'Medium'
    if (!difficultyRaw) {
      warnings.push({
        row: sheetRow,
        message: 'ไม่ได้ระบุ Difficulty — ใช้ค่า default Medium',
      })
    }

    const weight = weightRaw === '' || weightRaw === null || weightRaw === undefined
      ? defaultWeight(difficulty)
      : asNumber(weightRaw, defaultWeight(difficulty))
    if (weightRaw === '' || weightRaw === null || weightRaw === undefined) {
      warnings.push({
        row: sheetRow,
        message: `ไม่ได้ระบุ Weight — ใช้ค่า default (${defaultWeight(difficulty)})`,
      })
    }

    questions.push({
      qid,
      section,
      questionTH,
      choices: { A: a, B: b, C: c, D: d },
      correct,
      explanationTH,
      difficulty,
      weight,
    })
  })

  // Detect duplicate QIDs.
  const seen = new Set<number>()
  for (const q of questions) {
    if (seen.has(q.qid)) {
      warnings.push({
        row: 0,
        message: `พบ QID ซ้ำ: ${q.qid}`,
      })
    }
    seen.add(q.qid)
  }

  return { questions, errors, warnings }
}

function aoaSheet(rows: (string | number | boolean | null)[][]) {
  return XLSX.utils.aoa_to_sheet(rows)
}

export function exportResults(result: ResultSummary): void {
  const wb = XLSX.utils.book_new()

  // ----- Summary sheet -----
  const summaryRows: (string | number | boolean | null)[][] = [
    ['NSL Foods · Factory Manager Interview — Result Summary'],
    [],
    ['Candidate', result.candidate.fullName],
    ['Position', result.candidate.position],
    ['Interview Date', result.candidate.interviewDate],
    ['Interviewer', result.candidate.interviewer],
    ['Started At', result.startedAt],
    ['Finished At', result.finishedAt],
    ['Duration', formatDuration(result.durationMs)],
    [],
    ['Total Score', `${result.totalScore} / ${result.totalMax}`],
    ['Percent', `${result.percent.toFixed(2)}%`],
    ['Pass Threshold', `${result.passThreshold}%`],
    ['Result', result.passed ? 'PASS' : 'FAIL'],
    [],
    ['Section Breakdown'],
    ['Section', 'Earned', 'Max', 'Items', 'Correct'],
    ...result.bySection.map((s) => [
      s.section,
      s.earned,
      s.max,
      s.count,
      s.correctCount,
    ]),
  ]
  XLSX.utils.book_append_sheet(wb, aoaSheet(summaryRows), 'Summary')

  // ----- Detail sheet -----
  const detailHeader = [
    'QID',
    'Section',
    'Difficulty',
    'Weight',
    'Question (TH)',
    'Choice A',
    'Choice B',
    'Choice C',
    'Choice D',
    'Candidate Answer',
    'Correct',
    'Result',
    'Earned',
    'Explanation (TH)',
  ]
  const detailRows: (string | number | boolean | null)[][] = [detailHeader]
  for (const q of result.questions) {
    const ans = result.answers.find((a) => a.qid === q.qid)
    const choice = ans?.choice ?? ''
    const correct = q.correct
    const isOk = choice === correct
    detailRows.push([
      q.qid,
      q.section,
      q.difficulty,
      q.weight,
      q.questionTH,
      q.choices.A,
      q.choices.B,
      q.choices.C,
      q.choices.D,
      choice,
      correct,
      isOk ? 'Correct' : choice === '' ? 'No answer' : 'Wrong',
      isOk ? q.weight : 0,
      q.explanationTH,
    ])
  }
  XLSX.utils.book_append_sheet(wb, aoaSheet(detailRows), 'Detail')

  const safeName = result.candidate.fullName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '') || 'candidate'
  const stamp = result.finishedAt.replace(/[:.]/g, '-')
  XLSX.writeFile(wb, `NSL_Interview_${safeName}_${stamp}.xlsx`)
}
