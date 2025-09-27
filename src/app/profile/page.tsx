'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameApiService, GameState } from '@/services/GameApiService'
import { SessionService } from '@/services/SessionService'

export default function ProfilePage() {
  const router = useRouter()
  const [activeGames, setActiveGames] = useState<GameState[]>([])
  const [loading, setLoading] = useState(true)
  const [gameApiService] = useState(() => GameApiService.getInstance())
  const [sessionService] = useState(() => SessionService.getInstance())
  const [identity, setIdentity] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Récupérer l'identité du joueur
        const playerIdentity = sessionService.getOrCreateIdentity()
        setIdentity(playerIdentity)

        // Récupérer les parties actives
        const response = await gameApiService.getActiveGamesByPlayer(playerIdentity.identity)
        
        if (response.success && response.games) {
          setActiveGames(response.games)
        } else {
          console.error('Erreur lors du chargement des parties:', response.error)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [gameApiService, sessionService])

  const getPlayerColor = (game: GameState, playerId: string): 'white' | 'black' | null => {
    if (game.whitePlayerId === playerId) return 'white'
    if (game.blackPlayerId === playerId) return 'black'
    return null
  }

  const getGameStatusText = (game: GameState) => {
    switch (game.status) {
      case 'waiting':
        return 'En attente d\'adversaire'
      case 'active':
        return 'Partie en cours'
      case 'finished':
        return 'Partie terminée'
      default:
        return 'Statut inconnu'
    }
  }

  const getGameStatusColor = (game: GameState) => {
    switch (game.status) {
      case 'waiting':
        return 'text-yellow-400'
      case 'active':
        return 'text-green-400'
      case 'finished':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const resumeGame = (code: string) => {
    router.push(`/game/${code}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-300">Chargement du profil...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête du profil */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: identity?.avatarColor || '#3b82f6' }}
              >
                {identity?.firstName?.[0] || 'J'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">
                  {sessionService.displayName(identity)}
                </h1>
                <p className="text-slate-400">
                  Parties actives : {activeGames.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parties en cours */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            Mes parties en cours
          </h2>

          {activeGames.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-8 border border-slate-800 text-center">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Aucune partie en cours</h3>
              <p className="text-slate-400 mb-6">
                Créez une nouvelle partie ou rejoignez-en une pour commencer à jouer !
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
              >
                Nouvelle partie
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeGames.map((game) => {
                const playerColor = getPlayerColor(game, identity?.identity)
                return (
                  <div key={game.id} className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="font-mono bg-slate-800 px-3 py-1 rounded text-slate-100 text-sm">
                            {game.code}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            getGameStatusColor(game)
                          } bg-slate-800/50`}>
                            {getGameStatusText(game)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              playerColor === 'white' 
                                ? 'bg-white shadow-lg shadow-white/30' 
                                : 'bg-slate-800 shadow-lg shadow-slate-800/30'
                            }`}></div>
                            <span>Tu joues les {playerColor === 'white' ? 'blancs' : 'noirs'}</span>
                          </div>
                          
                          <div>
                            Coup #{game.moveCount}
                          </div>
                          
                          <div>
                            Créée le {new Date(game.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {game.status === 'active' && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>À ton tour</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => resumeGame(game.code)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reprendre
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}