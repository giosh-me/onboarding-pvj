interface Item {
  name: string
  when?: string
  pros?: string[]
  cons?: string[]
}

export function Comparison({ items }: { items: Item[] }) {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.name} className="rounded-md border border-pvj-cream-200 bg-white p-5">
          <h3 className="display text-xl mb-2">{it.name}</h3>
          {it.when && <p className="text-sm text-pvj-navy/60 mb-3">{it.when}</p>}
          {it.pros && (
            <>
              <p className="text-xs uppercase tracking-wider text-success mt-2 mb-1">Pro</p>
              <ul className="list-disc pl-5 text-sm">
                {it.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
          {it.cons && (
            <>
              <p className="text-xs uppercase tracking-wider text-error mt-3 mb-1">Contro</p>
              <ul className="list-disc pl-5 text-sm">
                {it.cons.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
