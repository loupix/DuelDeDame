'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SessionService } from '@/services/SessionService'
import { findFlagUrlByIso2Code } from 'country-flags-svg-v2'

// Composant pour afficher le drapeau du pays
const CountryFlag = ({ countryCode }: { countryCode: string }) => {
  try {
    const flagUrl = findFlagUrlByIso2Code(countryCode)
    if (flagUrl) {
      return (
        <img 
          src={flagUrl} 
          alt={`Drapeau ${countryCode}`}
          className="w-5 h-4 object-cover rounded-sm"
          title={countryCode}
        />
      )
    }
  } catch (error) {
    console.warn('Erreur lors du chargement du drapeau:', error)
  }
  
  // Fallback avec emoji
  return <span className="text-lg" title="Pays non détecté">🌍</span>
}

export default function Navbar() {
  const sessionService = SessionService.getInstance()
  const [identity, setIdentity] = useState<{ identity: string; firstName: string; lastName: string; avatarColor: string; countryCode: string; language: string; timezone: string } | null>(null)
  const [open, setOpen] = useState(false)
  const [matches, setMatches] = useState<Array<{ id: string; code: string; result: 'win'|'loss'|'draw'; color: 'white'|'black'; duration: number; moves: number; createdAt: string }>>([])

  useEffect(() => {
    const obj = sessionService.getOrCreateIdentity()
    console.log('Navbar - Identity loaded:', obj)
    setIdentity(obj)
  }, [])

  useEffect(() => {
    if (!identity) return
    sessionService.listMatches(identity.identity).then(setMatches).catch(() => {})
  }, [identity])

  return (
    <div className="sticky top-0 z-20 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <div className="px-3 py-1 bg-slate-800 rounded-md text-sm cursor-default flex items-center gap-2">
              {identity && identity.countryCode && (
                <CountryFlag countryCode={identity.countryCode} />
              )}
              {identity && !identity.countryCode && (
                <span className="text-lg" title="Pays non détecté">
                  🌍
                </span>
              )}
              <span>{identity ? sessionService.displayName(identity) : '...'}</span>
            </div>
            {open && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg p-2 max-h-96 overflow-auto">
                <div className="px-2 py-1 text-xs text-slate-300">Vos derniers matchs</div>
                <div className="divide-y divide-slate-700">
                  {matches.length === 0 && (
                    <div className="px-3 py-3 text-sm text-slate-400">Aucun match enregistré</div>
                  )}
                  {matches.map(m => (
                    <div key={m.id} className="px-3 py-2 text-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.result === 'win' ? 'Victoire' : m.result === 'loss' ? 'Défaite' : 'Égalité'} • {m.color === 'white' ? 'Blanc' : 'Noir'}</div>
                        <div className="text-slate-400 text-xs">{new Date(m.createdAt).toLocaleString('fr-FR')} • {m.moves} coups • {m.duration}s</div>
                      </div>
                      <div className="text-xs text-slate-400">{m.code}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/replays" className="text-sm text-slate-300 hover:text-white">Replays</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Duel de Dame</Link>
        </div>
      </div>
    </div>
  )
}

