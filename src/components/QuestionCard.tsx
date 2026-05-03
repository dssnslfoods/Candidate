import { useMemo } from 'react'
import type { Choice, Question, InterviewMode } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/Card'
import { RadioOption } from '@/components/ui/RadioOption'
import { Alert } from '@/components/ui/Alert'
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react'

interface QuestionCardProps {
  question: Question
  index: number
  total: number
  selected: Choice | null
  confirmed: boolean
  mode: InterviewMode
  onSelect: (c: Choice) => void
}

const difficultyTone = {
  Easy: 'green',
  Medium: 'gold',
  Hard: 'red',
} as const

export function QuestionCard({
  question,
  index,
  total,
  selected,
  confirmed,
  mode,
  onSelect,
}: QuestionCardProps) {
  const reveal = mode === 'review' && confirmed
  const correct = question.correct
  const wasCorrect = selected === correct

  const letters = useMemo(() => ['A', 'B', 'C', 'D'] as const, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cream">QID {question.qid}</Badge>
            <Badge tone="berry">{question.section}</Badge>
            <Badge tone={difficultyTone[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <Badge tone="gold">+{question.weight} คะแนน</Badge>
          </div>
          <div className="text-xs font-medium text-ink-400">
            ข้อ {index + 1} / {total}
          </div>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-relaxed text-ink-700 sm:text-xl">
          {question.questionTH}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2.5">
          {letters.map((L) => {
            const text = question.choices[L]
            let state: React.ComponentProps<typeof RadioOption>['state'] = 'default'
            if (reveal) {
              if (L === correct) state = 'reveal-correct'
              if (selected === L && L !== correct) state = 'wrong'
              if (selected === L && L === correct) state = 'correct'
            }
            return (
              <RadioOption
                key={L}
                letter={L}
                selected={selected === L}
                state={state}
                disabled={confirmed}
                onSelect={() => onSelect(L)}
              >
                {text}
              </RadioOption>
            )
          })}
        </div>

        {reveal ? (
          <div className="mt-4">
            <Alert
              tone={wasCorrect ? 'success' : 'danger'}
              icon={
                wasCorrect ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )
              }
              title={
                wasCorrect
                  ? `ถูกต้อง (+${question.weight} คะแนน)`
                  : `ไม่ถูกต้อง — เฉลย: ${correct}`
              }
            >
              <div className="flex gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                <span>{question.explanationTH}</span>
              </div>
            </Alert>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
