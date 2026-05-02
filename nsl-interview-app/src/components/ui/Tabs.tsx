import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TabsProps<T extends string> {
  value: T
  onValueChange: (v: T) => void
  options: { value: T; label: ReactNode; description?: ReactNode }[]
  className?: string
}

export function Tabs<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn('grid gap-2 sm:grid-cols-2', className)}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              'text-left rounded-xl border px-4 py-3 transition',
              active
                ? 'border-berry-400 bg-berry-50 ring-2 ring-berry-300/40'
                : 'border-cream-200 bg-white hover:border-berry-200',
            )}
          >
            <div
              className={cn(
                'font-semibold',
                active ? 'text-berry-700' : 'text-ink-700',
              )}
            >
              {opt.label}
            </div>
            {opt.description ? (
              <div className="mt-1 text-xs text-ink-400">{opt.description}</div>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
