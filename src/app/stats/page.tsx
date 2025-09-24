'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  averageGameTime: number
  bestStreak: number
  currentStreak: number
  favoriteColor: 'white' | 'black'
  totalPlayTime: number
}

interface GameRecord {
  id: string
  date: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  color: 'white' | 'black'
  duration: number
  moves: number
  code: string
}

export default function StatsPage() {
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    averageGameTime: 0,
    bestStreak: 0,
    currentStreak: 0,
    favoriteColor: 'white',
    totalPlayTime: 0
  })
  
  const [recentGames, setRecentGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les statistiques depuis le localStorage
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem('gameStats')
        const savedGames = localStorage.getItem('gameHistory')
        
        if (savedStats) {
          setStats(JSON.parse(savedStats))
        }
        
        if (savedGames) {
          const games = JSON.parse(savedGames)
          setRecentGames(games.slice(0, 10)) // 10 dernières parties
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
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

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400'
      case 'loss': return 'text-red-400'
      case 'draw': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des statistiques...</p>
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
              href="/replays" 
              className="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors duration-200"
            >
              Replays
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Épuré */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4 text-slate-100">
              Statistiques
            </h1>
            <p className="text-slate-400">
              Analysez vos performances
            </p>
          </div>

          {/* Stats Overview Épuré */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <div className="text-2xl font-bold text-slate-100 mb-1">{stats.totalGames}</div>
              <div className="text-sm text-slate-400">Parties</div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <div className="text-2xl font-bold text-slate-100 mb-1">{stats.wins}</div>
              <div className="text-sm text-slate-400">Victoires</div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <div className="text-2xl font-bold text-slate-100 mb-1">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Taux</div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <div className="text-2xl font-bold text-slate-100 mb-1">{stats.bestStreak}</div>
              <div className="text-sm text-slate-400">Série</div>
            </div>
          </div>

          {/* Detailed Stats Épuré */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Performance Metrics */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Performance</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Défaites</span>
                  <span className="text-slate-200 font-medium">{stats.losses}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Égalités</span>
                  <span className="text-slate-200 font-medium">{stats.draws}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Série actuelle</span>
                  <span className="text-slate-200 font-medium">{stats.currentStreak}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Couleur préférée</span>
                  <span className="text-slate-200 font-medium">
                    {stats.favoriteColor === 'white' ? 'Blancs' : 'Noirs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Stats */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Temps de jeu</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Temps total</span>
                  <span className="text-slate-200 font-medium">{formatTime(stats.totalPlayTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Temps moyen</span>
                  <span className="text-slate-200 font-medium">{formatTime(stats.averageGameTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Parties par heure</span>
                  <span className="text-slate-200 font-medium">
                    {stats.totalPlayTime > 0 ? (stats.totalGames / (stats.totalPlayTime / 3600)).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games Épuré */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Parties récentes</h3>
            
            {recentGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">♟</div>
                <p className="text-slate-400 mb-2">Aucune partie enregistrée</p>
                <p className="text-slate-500 text-sm mb-4">Jouez votre première partie !</p>
                <Link 
                  href="/"
                  className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
                >
                  Commencer une partie
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div key={game.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{getResultIcon(game.result)}</div>
                      <div>
                        <div className="text-slate-100 font-medium">
                          {game.result === 'win' ? 'Victoire' : game.result === 'loss' ? 'Défaite' : 'Égalité'}
                        </div>
                        <div className="text-sm text-slate-400">
                          {new Date(game.date).toLocaleDateString('fr-FR')} • {game.moves} coups
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Couleur</div>
                        <div className="text-slate-200 font-medium">
                          {game.color === 'white' ? '⚪' : '⚫'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Durée</div>
                        <div className="text-slate-200 font-medium">{formatTime(game.duration)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Code</div>
                        <div className="text-slate-200 font-mono text-xs">{game.code}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}