'use client'
import { useEffect, useState } from 'react'
import { GameDataService } from '@/services/GameDataService'

interface CurrentGameInfoProps {
  className?: string
}

export default function CurrentGameInfo({ className = '' }: CurrentGameInfoProps) {
  const [gameInfo, setGameInfo] = useState<{
    code: string
    color: 'white' | 'black'
    moves: number
    duration: number
  } | null>(null)

  useEffect(() => {
    const gameDataService = GameDataService.getInstance()
    
    // Vérifier s'il y a une partie en cours
    const checkCurrentGame = () => {
      const info = gameDataService.getCurrentGameInfo()
      setGameInfo(info)
    }

    // Vérifier immédiatement
    checkCurrentGame()

    // Vérifier périodiquement (toutes les 5 secondes)
    const interval = setInterval(checkCurrentGame, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!gameInfo) return null

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getColorEmoji = (color: 'white' | 'black') => {
    return color === 'white' ? '⚪' : '⚫'
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
            <span className="text-slate-300 font-bold text-sm">♟</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-200">Partie en cours</h3>
            <p className="text-xs text-slate-400">Code: {gameInfo.code}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Couleur:</span>
            <span className="text-slate-200">{getColorEmoji(gameInfo.color)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Coups:</span>
            <span className="text-slate-200 font-medium">{gameInfo.moves}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Temps:</span>
            <span className="text-slate-200 font-medium">{formatDuration(gameInfo.duration)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          💡 Cette partie est automatiquement sauvegardée. Vous pouvez recharger la page sans perdre votre progression.
        </p>
      </div>
    </div>
  )
}