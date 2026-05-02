import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone =
  | 'berry'
  | 'gold'
  | 'green'
  | 'red'
  | 'gray'
  | 'cream'
  | 'blue'
  | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const tones: Record<Tone, string> = {
  berry: 'bg-berry-100 text-berry-700 ring-berry-200',
  gold: 'bg-gold-100 text-gold-600 ring-gold-200',
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-100 text-rose-700 ring-rose-200',
  gray: 'bg-ink-100 text-ink-500 ring-ink-200',
  cream: 'bg-cream-100 text-ink-600 ring-cream-200',
  blue: 'bg-sky-100 text-sky-700 ring-sky-200',
  outline: 'bg-white text-ink-600 ring-ink-200',
}

export function Badge({ className, tone = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
