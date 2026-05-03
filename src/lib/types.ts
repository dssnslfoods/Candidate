// Domain types for the NSL Bakery Factory Manager interview app.

export type Choice = 'A' | 'B' | 'C' | 'D'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Section =
  | 'Food Safety'
  | 'Bakery Tech'
  | 'Production Mgmt'
  | 'Leadership'
  | 'Cost & CI'
  | (string & {})

export interface Question {
  qid: number
  section: Section
  questionTH: string
  choices: Record<Choice, string>
  correct: Choice
  explanationTH: string
  difficulty: Difficulty
  weight: number
}

export interface Candidate {
  fullName: string
  position: string
  interviewDate: string
  interviewer: string
}

export type InterviewMode = 'live' | 'review'

export interface Answer {
  qid: number
  choice: Choice | null
  // milliseconds spent on this question, optional
  msSpent?: number
}

export interface SectionScore {
  section: string
  earned: number
  max: number
  count: number
  correctCount: number
}

export interface ResultSummary {
  candidate: Candidate
  startedAt: string
  finishedAt: string
  durationMs: number
  totalScore: number
  totalMax: number
  percent: number
  passed: boolean
  passThreshold: number
  bySection: SectionScore[]
  answers: Answer[]
  questions: Question[]
}

export interface ParseError {
  row: number
  message: string
}

export interface ParseResult {
  questions: Question[]
  errors: ParseError[]
  warnings: ParseError[]
}
