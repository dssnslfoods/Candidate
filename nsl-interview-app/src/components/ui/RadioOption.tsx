import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface RadioOptionProps {
  selected: boolean
  letter: 'A' | 'B' | 'C' | 'D'
  onSelect: () => void
  disabled?: boolean
  state?: 'default' | 'correct' | 'wrong' | 'reveal-correct'
  children: ReactNode
}

export function RadioOption({
  selected,
  letter,
  onSelect,
  disabled,
  state = 'default',
  children,
}: RadioOptionProps) {
  const containerClass = cn(
    'group flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-400/50',
    state === 'default' &&
      (selected
        ? 'border-berry-500 ring-2 ring-berry-300/40 bg-berry-50/40'
        : 'border-cream-200 hover:border-berry-300'),
    state === 'correct' && 'border-emerald-500 bg-emerald-50/60',
    state === 'wrong' && 'border-rose-500 bg-rose-50/60',
    state === 'reveal-correct' && 'border-emerald-400 bg-emerald-50/40',
    disabled && 'cursor-not-allowed opacity-90',
  )

  const bulletClass = cn(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
    state === 'default' &&
      (selected
        ? 'bg-berry-600 text-white'
        : 'bg-cream-100 text-ink-500 group-hover:bg-berry-100 group-hover:text-berry-700'),
    state === 'correct' && 'bg-emerald-600 text-white',
    state === 'wrong' && 'bg-rose-600 text-white',
    state === 'reveal-correct' && 'bg-emerald-500 text-white',
  )

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={containerClass}
      aria-pressed={selected}
    >
      <span className={bulletClass}>{letter}</span>
      <span className="text-ink-700 leading-relaxed">{children}</span>
    </button>
  )
}
