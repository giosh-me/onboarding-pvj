import { clsx } from 'clsx'
import { Info, AlertTriangle, BookOpen } from 'lucide-react'

type Type = 'info' | 'warning' | 'note'

const map: Record<Type, { icon: React.ElementType; cls: string }> = {
  info: { icon: Info, cls: 'border-pvj-navy/20 bg-pvj-navy-50' },
  warning: { icon: AlertTriangle, cls: 'border-error/30 bg-error/5' },
  note: { icon: BookOpen, cls: 'border-pvj-gold-soft bg-pvj-gold-soft/20' },
}

export function Callout({ type = 'info', children }: { type?: Type; children: React.ReactNode }) {
  const { icon: Icon, cls } = map[type]
  return (
    <aside className={clsx('my-6 flex gap-3 rounded-md border-l-4 p-4', cls)}>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-pvj-navy" />
      <div className="text-pvj-navy/80">{children}</div>
    </aside>
  )
}
