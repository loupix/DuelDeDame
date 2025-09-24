'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Erreur de page:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-red-400">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">
            Oups ! Une erreur s'est produite
          </h1>
          <p className="text-slate-400 mb-6">
            Quelque chose s'est mal passé. Veuillez réessayer ou retourner à l'accueil.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Détails de l'erreur :</h3>
              <pre className="text-xs text-slate-300 overflow-auto">
                {error.message}
              </pre>
            </div>
          )}
        </div>
        
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
          >
            Réessayer
          </button>
          <Link 
            href="/"
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}