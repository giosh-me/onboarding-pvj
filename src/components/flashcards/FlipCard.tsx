'use client'
import { useState } from 'react'
import { clsx } from 'clsx'

export function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="relative mx-auto block h-[280px] w-full max-w-[480px] [perspective:1000px]"
      aria-label="Flip card"
    >
      <div
        className={clsx(
          'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-pvj-cream-200 bg-white p-6 [backface-visibility:hidden]">
          <p className="display text-2xl text-center">{front}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-pvj-gold-soft bg-pvj-cream p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-pvj-navy/80 text-center leading-relaxed">{back}</p>
        </div>
      </div>
    </button>
  )
}
