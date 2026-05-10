'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="text-center py-16">
      <h1 className="display mb-4">Qualcosa è andato storto</h1>
      <p className="text-pvj-navy/60 mb-6">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">Riprova</button>
    </section>
  )
}
