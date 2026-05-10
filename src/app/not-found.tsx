export default function NotFound() {
  return (
    <html>
      <body className="bg-pvj-cream text-pvj-navy min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="display text-4xl mb-4">404</h1>
        <p className="text-pvj-navy/60">Pagina non trovata · Page not found</p>
        <a href="/it" className="mt-6 underline decoration-pvj-gold-soft underline-offset-4">Dashboard</a>
      </body>
    </html>
  )
}
