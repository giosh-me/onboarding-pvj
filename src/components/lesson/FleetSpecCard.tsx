export function FleetSpecCard({
  model,
  pax,
  range,
  examples,
}: {
  model: string
  pax: string
  range: string
  examples?: string[]
}) {
  return (
    <div className="my-4 rounded-md border border-pvj-cream-200 bg-white p-4">
      <h4 className="display text-lg">{model}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-pvj-navy/60">Pax</dt>
        <dd>{pax}</dd>
        <dt className="text-pvj-navy/60">Range</dt>
        <dd>{range}</dd>
        {examples && (
          <>
            <dt className="text-pvj-navy/60">Esempi</dt>
            <dd>{examples.join(', ')}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
