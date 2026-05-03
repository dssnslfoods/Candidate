import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-berry-600 text-white hover:bg-berry-700 active:bg-berry-800 shadow-sm shadow-berry-900/20',
  secondary:
    'bg-cream-100 text-ink-700 hover:bg-cream-200 border border-cream-200',
  ghost: 'text-ink-600 hover:bg-cream-100',
  outline:
    'bg-white text-ink-700 border border-ink-200 hover:border-berry-400 hover:text-berry-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  gold: 'bg-gold-400 text-ink-700 hover:bg-gold-300 shadow-sm',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
