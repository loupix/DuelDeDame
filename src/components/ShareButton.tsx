'use client'
import { useState } from 'react'

interface ShareButtonProps {
  gameCode: string
}

export default function ShareButton({ gameCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}/join/${gameCode}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      setShowUrl(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins ma partie de Duel de Dame !',
          text: `Code de partie: ${gameCode}`,
          url: shareUrl
        })
      } catch (err) {
        console.error('Erreur lors du partage:', err)
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copié !</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Partager l'URL</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowUrl(!showUrl)}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🔗</span>
          <span>Voir l'URL</span>
        </button>
      </div>

      {showUrl && (
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-300 text-sm mb-2">URL de partage :</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm font-mono"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
      )}

      <p className="text-slate-400 text-xs">
        Partage cette URL avec ton adversaire pour qu'il puisse rejoindre la partie
      </p>
    </div>
  )
}