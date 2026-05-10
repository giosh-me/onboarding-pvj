export function ResultBar({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="rounded-md border border-pvj-cream-200 bg-white p-6 text-center">
      <p className="text-xs uppercase tracking-wider text-pvj-navy/50">Risultato</p>
      <p className="display mt-2 text-4xl">
        {correct}/{total}
      </p>
      <p className="mt-1 text-pvj-navy/60">{pct}%</p>
    </div>
  )
}
