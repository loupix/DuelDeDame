import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">♟</span>
          </div>
          <h1 className="text-6xl font-bold text-slate-100 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-300 mb-2">
            Page non trouvée
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-x-4">
          <Link 
            href="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link 
            href="/stats"
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium rounded-lg transition-colors"
          >
            Voir les statistiques
          </Link>
        </div>
      </div>
    </div>
  )
}