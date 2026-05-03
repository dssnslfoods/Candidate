import { ChefHat } from 'lucide-react'

interface BrandHeaderProps {
  subtitle?: string
}

export function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-berry-600 to-berry-800 text-white shadow-md shadow-berry-900/30">
          <ChefHat className="h-6 w-6" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight text-ink-700 sm:text-lg">
            NSL Foods PLC
          </div>
          <div className="text-xs text-ink-400 sm:text-sm">
            Factory Manager Interview · Bakery
          </div>
        </div>
      </div>
      {subtitle ? (
        <div className="hidden text-right text-xs text-ink-400 sm:block">
          {subtitle}
        </div>
      ) : null}
    </header>
  )
}
