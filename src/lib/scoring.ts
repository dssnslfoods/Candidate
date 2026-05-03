// Pure scoring helpers. No React, no side effects — easy to unit test later.

import type {
  Answer,
  Candidate,
  Question,
  ResultSummary,
  SectionScore,
} from './types'

export function totalMax(questions: Question[]): number {
  return questions.reduce((s, q) => s + (Number.isFinite(q.weight) ? q.weight : 0), 0)
}

export function answerFor(
  qid: number,
  answers: Answer[],
): Answer | undefined {
  return answers.find((a) => a.qid === qid)
}

export function isCorrect(q: Question, a: Answer | undefined): boolean {
  return !!a && a.choice === q.correct
}

export function totalScore(
  questions: Question[],
  answers: Answer[],
): number {
  return questions.reduce((sum, q) => {
    const a = answerFor(q.qid, answers)
    return isCorrect(q, a) ? sum + q.weight : sum
  }, 0)
}

export function groupBySection(
  questions: Question[],
  answers: Answer[],
): SectionScore[] {
  const map = new Map<string, SectionScore>()
  for (const q of questions) {
    const a = answerFor(q.qid, answers)
    const correct = isCorrect(q, a)
    const cur = map.get(q.section) ?? {
      section: q.section,
      earned: 0,
      max: 0,
      count: 0,
      correctCount: 0,
    }
    cur.max += q.weight
    cur.count += 1
    if (correct) {
      cur.earned += q.weight
      cur.correctCount += 1
    }
    map.set(q.section, cur)
  }
  return Array.from(map.values())
}

export function buildResult(args: {
  candidate: Candidate
  questions: Question[]
  answers: Answer[]
  startedAt: number
  finishedAt: number
  passThreshold: number
}): ResultSummary {
  const { candidate, questions, answers, startedAt, finishedAt, passThreshold } = args
  const max = totalMax(questions)
  const score = totalScore(questions, answers)
  const percent = max === 0 ? 0 : (score / max) * 100
  return {
    candidate,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(finishedAt).toISOString(),
    durationMs: Math.max(0, finishedAt - startedAt),
    totalScore: score,
    totalMax: max,
    percent,
    passed: percent >= passThreshold,
    passThreshold,
    bySection: groupBySection(questions, answers),
    answers,
    questions,
  }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
