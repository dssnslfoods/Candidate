// Generate `public/NSL_BakeryFactoryManager_Interview_QuestionBank.xlsx`
// from `src/data/sample.json` so users can download a ready-to-edit template.

import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')

const samplePath = resolve(root, 'src/data/sample.json')
const outDir = resolve(root, 'public')
const outPath = resolve(
  outDir,
  'NSL_BakeryFactoryManager_Interview_QuestionBank.xlsx',
)

const sample = JSON.parse(readFileSync(samplePath, 'utf-8'))

const headers = [
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
]

const rows = [headers]
for (const q of sample) {
  rows.push([
    q.qid,
    q.section,
    q.questionTH,
    q.choices.A,
    q.choices.B,
    q.choices.C,
    q.choices.D,
    q.correct,
    q.explanationTH,
    q.difficulty,
    q.weight,
  ])
}

const ws = XLSX.utils.aoa_to_sheet(rows)
ws['!cols'] = [
  { wch: 6 },
  { wch: 18 },
  { wch: 60 },
  { wch: 36 },
  { wch: 36 },
  { wch: 36 },
  { wch: 36 },
  { wch: 8 },
  { wch: 60 },
  { wch: 12 },
  { wch: 8 },
]

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Questions')

mkdirSync(outDir, { recursive: true })
XLSX.writeFile(wb, outPath)
console.log(`✓ Wrote ${outPath}`)
