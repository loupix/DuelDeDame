'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SessionService } from '@/services/SessionService'
import { GameApiService } from '@/services/GameApiService'
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
  const gameApiService = GameApiService.getInstance()
  const [identity, setIdentity] = useState<{ identity: string; firstName: string; lastName: string; avatarColor: string; countryCode: string; language: string; timezone: string } | null>(null)
  const [open, setOpen] = useState(false)
  const [activeGames, setActiveGames] = useState<Array<{ id: string; code: string; status: 'waiting' | 'active' | 'finished'; currentTurn?: 'white' | 'black'; whitePlayerId?: string; blackPlayerId?: string; moveCount: number; createdAt: string; updatedAt: string }>>([])

  useEffect(() => {
    const obj = sessionService.getOrCreateIdentity()
    console.log('Navbar - Identity loaded:', obj)
    setIdentity(obj)
  }, [])

  const fetchActiveGames = () => {
    if (!identity) return
    console.log('Navbar - Fetching active games for:', identity.identity)
    gameApiService.getActiveGamesByPlayer(identity.identity).then(response => {
      console.log('Navbar - Active games response:', response)
      if (response.success && response.games) {
        setActiveGames(response.games)
      } else {
        console.log('Navbar - No active games or error:', response.error)
      }
    }).catch(error => {
      console.error('Navbar - Error fetching active games:', error)
    })
  }

  useEffect(() => {
    fetchActiveGames()
  }, [identity, gameApiService])

  // Rafraîchir les parties toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(fetchActiveGames, 5000)
    return () => clearInterval(interval)
  }, [identity, gameApiService])

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
              <>
                {/* Zone invisible pour combler le gap */}
                <div 
                  className="absolute left-0 top-full w-80 h-2"
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => setOpen(false)}
                />
                <div 
                  className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg overflow-hidden"
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => setOpen(false)}
                >
                {/* Header du profil */}
                <div className="px-4 py-3 bg-slate-700 border-b border-slate-600">
                  <div className="flex items-center gap-3">
                    {/* Avatar avec initiales */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: identity?.avatarColor || '#6366f1' }}
                    >
                      {identity ? `${identity.firstName?.[0] || ''}${identity.lastName?.[0] || ''}`.toUpperCase() : '??'}
                    </div>
                    {/* Informations du profil */}
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {identity ? `${identity.firstName} ${identity.lastName}` : 'Utilisateur'}
                      </div>
                      <div className="text-slate-300 text-xs">
                        {identity?.countryCode && (
                          <span className="flex items-center gap-1">
                            <CountryFlag countryCode={identity.countryCode} />
                            {identity.countryCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Section des parties actives */}
                <div className="p-2 max-h-64 overflow-auto">
                  <div className="px-2 py-1 text-xs text-slate-300 font-medium">Vos parties en cours</div>
                  <div className="divide-y divide-slate-700">
                  {activeGames.length === 0 && (
                    <div className="px-3 py-3 text-sm text-slate-400">
                      Aucune partie en cours
                      <div className="text-xs text-slate-500 mt-1">
                        Créez une partie pour la voir apparaître ici
                      </div>
                    </div>
                  )}
                  {activeGames.map(game => {
                    const playerColor = game.whitePlayerId === identity?.identity ? 'white' : 'black'
                    const isMyTurn = game.currentTurn === playerColor
                    return (
                      <div key={game.id} className="px-3 py-2 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-slate-200">{game.code}</div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            game.status === 'waiting' ? 'bg-yellow-900/30 text-yellow-400' :
                            game.status === 'active' ? 'bg-green-900/30 text-green-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}>
                            {game.status === 'waiting' ? 'En attente' :
                             game.status === 'active' ? (isMyTurn ? 'À toi' : 'En cours') :
                             'Terminée'}
                          </div>
                        </div>
                        <div className="text-slate-400 text-xs">
                          {playerColor === 'white' ? 'Blancs' : 'Noirs'} • {game.moveCount} coups
                        </div>
                        <div className="text-slate-500 text-xs">
                          {new Date(game.updatedAt).toLocaleString('fr-FR')}
                        </div>
                        {game.status !== 'finished' && (
                          <Link 
                            href={`/game/${game.code}`}
                            className="inline-block mt-1 text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => setOpen(false)}
                          >
                            Reprendre →
                          </Link>
                        )}
                      </div>
                    )
                  })}
                  </div>
                </div>
                </div>
              </>
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

