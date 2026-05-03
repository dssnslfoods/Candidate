import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-cream-200 bg-white px-3 text-sm text-ink-700 placeholder:text-ink-300',
        'focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-300/40',
        'disabled:bg-cream-100 disabled:text-ink-400',
        className,
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-ink-600 mb-1.5 inline-block',
        className,
      )}
      {...props}
    />
  )
}
