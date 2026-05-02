import { cn } from '@/lib/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  tone?: 'berry' | 'gold' | 'green'
}

const tones = {
  berry: 'from-berry-500 to-berry-600',
  gold: 'from-gold-300 to-gold-500',
  green: 'from-emerald-400 to-emerald-600',
} as const

export function Progress({
  value,
  max = 100,
  className,
  tone = 'berry',
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      className={cn(
        'h-2.5 w-full overflow-hidden rounded-full bg-cream-200/70',
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          'h-full bg-gradient-to-r transition-[width] duration-500 ease-out',
          tones[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
