import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ToastTone = 'info' | 'success' | 'warning' | 'danger'

interface ToastItem {
  id: number
  tone: ToastTone
  title?: string
  message: string
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}

const toneClass: Record<ToastTone, string> = {
  info: 'bg-white ring-cream-200 text-ink-700',
  success: 'bg-emerald-50 ring-emerald-200 text-emerald-900',
  warning: 'bg-amber-50 ring-amber-200 text-amber-900',
  danger: 'bg-rose-50 ring-rose-200 text-rose-900',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { ...t, id }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto w-full max-w-md rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ring-inset',
              toneClass[t.tone],
            )}
          >
            {t.title ? <div className="font-semibold">{t.title}</div> : null}
            <div className="leading-relaxed">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
