'use client'
import { useEffect, useState } from 'react'
import { ReplayService, GameReplayData, RecentGame } from '@/services/ReplayService'
import Link from 'next/link'

export default function ReplaysDBPage() {
  const [recentGames, setRecentGames] = useState<RecentGame[]>([])
  const [selectedGame, setSelectedGame] = useState<GameReplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)

  const replayService = ReplayService.getInstance()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Vérifier si l'API est disponible
        const available = await replayService.isApiAvailable()
        setApiAvailable(available)
        
        if (available) {
          // Charger les parties récentes
          const games = await replayService.getRecentGames(20)
          setRecentGames(games)
        } else {
          setError('L\'API n\'est pas disponible. Assurez-vous que le serveur backend est démarré.')
        }
      } catch (err) {
        setError('Erreur lors du chargement des données')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadGameReplay = async (code: string) => {
    try {
      setLoading(true)
      const replay = await replayService.getGameReplay(code)
      setSelectedGame(replay)
    } catch (err) {
      setError('Erreur lors du chargement du replay')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getResultIcon = (winner: 'white' | 'black' | null) => {
    if (!winner) return '🤝'
    return winner === 'white' ? '⚪' : '⚫'
  }

  const getResultColor = (winner: 'white' | 'black' | null) => {
    if (!winner) return 'text-yellow-400'
    return winner === 'white' ? 'text-white' : 'text-gray-800'
  }

  if (loading && recentGames.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des replays...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-slate-100 mb-2">Erreur</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
                <span className="text-slate-300 font-bold text-lg">♟</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-100">
                Duel de Dame
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/replays"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Replays Locaux
            </Link>
            <Link 
              href="/stats"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Statistiques
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-100">
              Replays de la Base de Données
            </h2>
            <p className="text-slate-400">
              Parties enregistrées automatiquement sur le serveur
            </p>
            {apiAvailable && (
              <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-900/20 border border-green-800 rounded-full text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                API connectée
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des parties récentes */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-semibold text-slate-100 mb-6">
                Parties Récentes ({recentGames.length})
              </h3>
              
              {recentGames.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-500 text-4xl mb-4">📝</div>
                  <p className="text-slate-400">Aucune partie enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentGames.map((game) => (
                    <div
                      key={game.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedGame?.game.id === game.id
                          ? 'bg-slate-700 border-slate-600'
                          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                      }`}
                      onClick={() => loadGameReplay(game.code)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-300 bg-slate-700 px-2 py-1 rounded text-sm">
                            {game.code}
                          </span>
                          <span className={`text-lg ${getResultColor(game.winner)}`}>
                            {getResultIcon(game.winner)}
                          </span>
                        </div>
                        <span className="text-slate-400 text-sm">
                          {formatDate(game.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-300">
                          {game.whitePlayerName} vs {game.blackPlayerName}
                        </div>
                        <div className="text-slate-400">
                          {game.moveCount} coups • {formatTime(game.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Détails du replay sélectionné */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-semibold text-slate-100 mb-6">
                Détails du Replay
              </h3>
              
              {!selectedGame ? (
                <div className="text-center py-8">
                  <div className="text-slate-500 text-4xl mb-4">🎯</div>
                  <p className="text-slate-400">Sélectionnez une partie pour voir le replay</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Informations de la partie */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-slate-300 bg-slate-700 px-2 py-1 rounded">
                        {selectedGame.game.code}
                      </span>
                      <span className={`text-lg ${getResultColor(selectedGame.game.winner)}`}>
                        {getResultIcon(selectedGame.game.winner)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Joueurs:</span>
                        <div className="text-slate-200">
                          {selectedGame.game.whitePlayerName} vs {selectedGame.game.blackPlayerName}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Durée:</span>
                        <div className="text-slate-200">{formatTime(selectedGame.game.duration)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Coups:</span>
                        <div className="text-slate-200">{selectedGame.game.moveCount}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Date:</span>
                        <div className="text-slate-200">{formatDate(selectedGame.game.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Liste des mouvements */}
                  <div>
                    <h4 className="text-lg font-medium text-slate-100 mb-3">
                      Mouvements ({selectedGame.moves.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedGame.moves.map((move, index) => (
                        <div
                          key={move.id}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400 text-sm w-8">
                              {move.moveNumber}.
                            </span>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              move.player === 'white' 
                                ? 'bg-white text-gray-800' 
                                : 'bg-gray-800 text-white'
                            }`}>
                              {move.player === 'white' ? 'B' : 'N'}
                            </span>
                            <span className="text-slate-200 font-mono">
                              {move.notation}
                            </span>
                            {move.isCapture && (
                              <span className="text-red-400 text-xs">💥</span>
                            )}
                          </div>
                          <span className="text-slate-400 text-xs">
                            {new Date(move.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}