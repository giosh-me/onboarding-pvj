'use client'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

export function ResetDialog({ onConfirm }: { onConfirm: () => void }) {
  const t = useTranslations('Reset')
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="text-sm text-pvj-navy/50 hover:text-error"
      >
        {t('button')}
      </button>
      <dialog ref={ref} className="rounded-md backdrop:bg-pvj-navy/40 p-6 max-w-md">
        <h3 className="display text-xl mb-3">{t('title')}</h3>
        <p className="text-pvj-navy/70 mb-6">{t('body')}</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => ref.current?.close()} className="px-4 py-2 text-pvj-navy/60">
            {t('cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm()
              ref.current?.close()
            }}
            className="rounded-md bg-error px-4 py-2 text-white hover:bg-error/90"
          >
            {t('confirm')}
          </button>
        </div>
      </dialog>
    </>
  )
}
