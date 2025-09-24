'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur globale
    console.error('Erreur globale:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-red-400">💥</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-100 mb-4">
                Erreur critique
              </h1>
              <p className="text-slate-400 mb-6">
                Une erreur grave s'est produite. Veuillez recharger la page.
              </p>
            </div>
            
            <button
              onClick={reset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}