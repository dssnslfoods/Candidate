import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: Tone
  icon?: ReactNode
  title?: ReactNode
}

const tones: Record<Tone, string> = {
  info: 'bg-sky-50 text-sky-900 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-rose-50 text-rose-900 ring-rose-200',
}

export function Alert({
  className,
  tone = 'info',
  icon,
  title,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl ring-1 ring-inset px-4 py-3 text-sm flex gap-3',
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="font-semibold mb-0.5">{title}</div> : null}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
