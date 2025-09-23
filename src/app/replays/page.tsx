'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GameReplay {
  id: string
  date: string
  duration: number
  moves: MoveRecord[]
  result: 'win' | 'loss' | 'draw'
  color: 'white' | 'black'
  code: string
  highlights: Highlight[]
}

interface MoveRecord {
  from: [number, number]
  to: [number, number]
  timestamp: number
  player: 'white' | 'black'
  piece: string
  capture?: boolean
  promotion?: boolean
}

interface Highlight {
  moveIndex: number
  type: 'brilliant' | 'mistake' | 'blunder' | 'tactical'
  description: string
  score: number
}

export default function ReplaysPage() {
  const [replays, setReplays] = useState<GameReplay[]>([])
  const [selectedReplay, setSelectedReplay] = useState<GameReplay | null>(null)
  const [currentMove, setCurrentMove] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReplays = () => {
      try {
        const savedReplays = localStorage.getItem('gameReplays')
        if (savedReplays) {
          setReplays(JSON.parse(savedReplays))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des replays:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReplays()
  }, [])

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

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆'
      case 'loss': return '💔'
      case 'draw': return '🤝'
      default: return '❓'
    }
  }

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'brilliant': return '✨'
      case 'mistake': return '⚠️'
      case 'blunder': return '💥'
      case 'tactical': return '🧠'
      default: return '📝'
    }
  }

  const getHighlightColor = (type: string) => {
    switch (type) {
      case 'brilliant': return 'text-yellow-400'
      case 'mistake': return 'text-orange-400'
      case 'blunder': return 'text-red-400'
      case 'tactical': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const playReplay = (replay: GameReplay) => {
    setSelectedReplay(replay)
    setCurrentMove(0)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    if (!selectedReplay) return
    setIsPlaying(!isPlaying)
  }

  const nextMove = () => {
    if (!selectedReplay) return
    if (currentMove < selectedReplay.moves.length - 1) {
      setCurrentMove(currentMove + 1)
    }
  }

  const prevMove = () => {
    if (!selectedReplay) return
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1)
    }
  }

  const goToMove = (moveIndex: number) => {
    if (!selectedReplay) return
    setCurrentMove(Math.max(0, Math.min(moveIndex, selectedReplay.moves.length - 1)))
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !selectedReplay) return

    const interval = setInterval(() => {
      if (currentMove < selectedReplay.moves.length - 1) {
        setCurrentMove(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, 1000) // 1 seconde par coup

    return () => clearInterval(interval)
  }, [isPlaying, currentMove, selectedReplay])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des replays...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Épurée */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
              <span className="text-slate-300 font-bold text-lg">♟</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-100">
              Duel de Dame
            </h1>
          </Link>
          <div className="flex space-x-2">
            <Link 
              href="/" 
              className="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors duration-200"
            >
              Accueil
            </Link>
            <Link 
              href="/stats" 
              className="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors duration-200"
            >
              Statistiques
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Épuré */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4 text-slate-100">
              Replays
            </h1>
            <p className="text-slate-400">
              Revivez vos meilleurs moments
            </p>
          </div>

          {replays.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">♟</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Aucun replay disponible</h3>
              <p className="text-slate-400 mb-6">
                Jouez des parties pour voir vos replays ici
              </p>
              <Link 
                href="/"
                className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
              >
                Commencer une partie
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Replay List Épuré */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Bibliothèque</h3>
                  
                  <div className="space-y-2">
                    {replays.map((replay) => (
                      <div 
                        key={replay.id}
                        onClick={() => playReplay(replay)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedReplay?.id === replay.id
                            ? 'bg-slate-700 border-slate-600'
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getResultIcon(replay.result)}</span>
                            <span className="text-slate-100 font-medium text-sm">
                              {replay.result === 'win' ? 'Victoire' : replay.result === 'loss' ? 'Défaite' : 'Égalité'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(replay.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{replay.moves.length} coups</span>
                          <span>{formatTime(replay.duration)}</span>
                        </div>
                        
                        {replay.highlights.length > 0 && (
                          <div className="mt-1 flex space-x-1">
                            {replay.highlights.slice(0, 3).map((highlight, index) => (
                              <span key={index} className="text-xs">
                                {getHighlightIcon(highlight.type)}
                              </span>
                            ))}
                            {replay.highlights.length > 3 && (
                              <span className="text-xs text-slate-500">+{replay.highlights.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Replay Viewer Épuré */}
              <div className="lg:col-span-2">
                {selectedReplay ? (
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-100">
                        Replay du {new Date(selectedReplay.date).toLocaleDateString('fr-FR')}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">
                          {currentMove + 1} / {selectedReplay.moves.length}
                        </span>
                      </div>
                    </div>

                    {/* Board Placeholder Épuré */}
                    <div className="bg-slate-800 rounded-lg p-6 mb-6 text-center">
                      <div className="text-4xl mb-3">♟</div>
                      <p className="text-slate-400 mb-2">Plateau de jeu</p>
                      <p className="text-sm text-slate-500">
                        Coup {currentMove + 1}: {selectedReplay.moves[currentMove]?.player === 'white' ? '⚪' : '⚫'} 
                        {selectedReplay.moves[currentMove] ? 
                          ` ${selectedReplay.moves[currentMove].from[0]},${selectedReplay.moves[currentMove].from[1]} → ${selectedReplay.moves[currentMove].to[0]},${selectedReplay.moves[currentMove].to[1]}` 
                          : 'Fin de partie'
                        }
                      </p>
                    </div>

                    {/* Controls Épurés */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={prevMove}
                          disabled={currentMove === 0}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-100 rounded-md transition-colors text-sm"
                        >
                          Précédent
                        </button>
                        
                        <button
                          onClick={togglePlayPause}
                          className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-md transition-colors text-sm"
                        >
                          {isPlaying ? 'Pause' : 'Lecture'}
                        </button>
                        
                        <button
                          onClick={nextMove}
                          disabled={currentMove === selectedReplay.moves.length - 1}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-100 rounded-md transition-colors text-sm"
                        >
                          Suivant
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max={selectedReplay.moves.length - 1}
                          value={currentMove}
                          onChange={(e) => goToMove(parseInt(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    </div>

                    {/* Highlights Épurés */}
                    {selectedReplay.highlights.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-100 mb-3">Moments marquants</h4>
                        <div className="space-y-2">
                          {selectedReplay.highlights.map((highlight, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                highlight.moveIndex === currentMove
                                  ? 'bg-slate-700 border-slate-600'
                                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                              }`}
                              onClick={() => goToMove(highlight.moveIndex)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{getHighlightIcon(highlight.type)}</span>
                                  <span className="text-slate-100 font-medium text-sm">
                                    Coup {highlight.moveIndex + 1}
                                  </span>
                                </div>
                                <span className={`text-xs font-medium ${getHighlightColor(highlight.type)}`}>
                                  {highlight.score > 0 ? '+' : ''}{highlight.score}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{highlight.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-8 border border-slate-800 text-center">
                    <div className="text-3xl mb-3">♟</div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Sélectionnez un replay</h3>
                    <p className="text-slate-400">Choisissez une partie dans la bibliothèque</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}