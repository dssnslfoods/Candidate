import { useMemo, useState } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { SetupScreen } from '@/components/SetupScreen'
import { InterviewScreen } from '@/components/InterviewScreen'
import { ResultsScreen } from '@/components/ResultsScreen'
import { ToastProvider } from '@/components/ui/Toast'
import { buildResult } from '@/lib/scoring'
import sample from '@/data/sample.json'
import type {
  Answer,
  Candidate,
  InterviewMode,
  Question,
  ResultSummary,
} from '@/lib/types'

type Screen = 'setup' | 'interview' | 'results'

interface RunState {
  questions: Question[]
  candidate: Candidate
  mode: InterviewMode
  passThreshold: number
  startedAt: number
}

function App() {
  // Sample data is loaded as the default question bank so the UI works
  // without any upload step.
  const initialQuestions = useMemo(() => sample as Question[], [])

  const [screen, setScreen] = useState<Screen>('setup')
  const [run, setRun] = useState<RunState | null>(null)
  const [result, setResult] = useState<ResultSummary | null>(null)

  const handleStart = (params: {
    questions: Question[]
    candidate: Candidate
    mode: InterviewMode
    passThreshold: number
  }) => {
    setRun({ ...params, startedAt: Date.now() })
    setScreen('interview')
  }

  const handleFinish = (answers: Answer[], finishedAt: number) => {
    if (!run) return
    const r = buildResult({
      candidate: run.candidate,
      questions: run.questions,
      answers,
      startedAt: run.startedAt,
      finishedAt,
      passThreshold: run.passThreshold,
    })
    setResult(r)
    setScreen('results')
  }

  const handleRestart = () => {
    setRun(null)
    setResult(null)
    setScreen('setup')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <BrandHeader
          subtitle={
            screen === 'interview'
              ? 'Interview in progress'
              : screen === 'results'
                ? 'Result summary'
                : 'Setup'
          }
        />
        {screen === 'setup' ? (
          <SetupScreen
            initialQuestions={initialQuestions}
            initialUsingSample={true}
            onStart={handleStart}
          />
        ) : null}
        {screen === 'interview' && run ? (
          <InterviewScreen
            questions={run.questions}
            candidate={run.candidate}
            mode={run.mode}
            startedAt={run.startedAt}
            onFinish={handleFinish}
            onCancel={handleRestart}
          />
        ) : null}
        {screen === 'results' && result ? (
          <ResultsScreen result={result} onRestart={handleRestart} />
        ) : null}

        <footer className="mx-auto max-w-6xl px-4 pb-6 pt-2 text-center text-xs text-ink-400">
          NSL Foods PLC · Factory Manager Interview System ·
          Built with React + Tailwind · {new Date().getFullYear()}
        </footer>
      </div>
    </ToastProvider>
  )
}

export default App
