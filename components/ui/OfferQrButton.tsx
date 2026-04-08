'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface OfferQrButtonProps {
  offerId: string
  offerTitle: string
}

export function OfferQrButton({ offerId, offerTitle }: OfferQrButtonProps) {
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const qrValue = useMemo(() => {
    if (!origin) return ''
    return `${origin}/offres/${offerId}?redeem=1`
  }, [offerId, origin])

  const qrImageUrl = useMemo(() => {
    if (!qrValue) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(qrValue)}`
  }, [qrValue])

  return (
    <>
      <Button className="w-full justify-center mb-3" size="lg" onClick={() => setOpen(true)}>
        <QrCode size={18} aria-hidden="true" />
        Utiliser cette offre
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-qr-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink mb-1">Proof of concept</p>
                <h2 id="offer-qr-title" className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {offerTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-alt text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-dark-alt border border-gray-100 dark:border-dark-border p-4 flex items-center justify-center min-h-[340px]">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt={`QR code pour ${offerTitle}`}
                  className="w-full max-w-[280px] h-auto rounded-xl bg-white p-3 shadow-sm"
                />
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Génération du QR code…</div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
