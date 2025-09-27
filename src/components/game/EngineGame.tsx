'use client'

import { useState, useEffect } from 'react'
import { EngineGameService } from '../../engine/EngineGameService'
import { EngineDifficulty } from '../../engine/factories/EngineStrategyFactory'
import Board from './Board'
import GameInfo from './GameInfo'

interface EngineGameProps {
  difficulty: EngineDifficulty
  onBack: () => void
}

export default function EngineGame({ difficulty, onBack }: EngineGameProps) {
  const [engineService] = useState(() => new EngineGameService(difficulty))
  const [game, setGame] = useState(engineService.getGame())
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [isEngineThinking, setIsEngineThinking] = useState(false)

  useEffect(() => {
    // Écouter les changements de jeu
    const updateGame = () => {
      setGame(engineService.getGame())
      setIsEngineThinking(engineService.getEnginePlayer().isEngineThinking())
    }

    engineService.getGame().addObserver(updateGame)
    
    return () => {
      // Nettoyer l'observer si nécessaire
    }
  }, [engineService])

  const handleSquareClick = async (position: [number, number]) => {
    if (isEngineThinking) return

    if (selectedSquare) {
      // Essayer de faire le mouvement
      const success = await engineService.makeHumanMove(selectedSquare, position)
      
      if (success) {
        setSelectedSquare(null)
      } else {
        // Si le mouvement échoue, sélectionner la nouvelle case
        setSelectedSquare(position)
      }
    } else {
      // Sélectionner une case
      const piece = game.getBoard().getPiece(position)
      if (piece && piece.getColor() === 'white') {
        setSelectedSquare(position)
      }
    }
  }

  const handleDifficultyChange = (newDifficulty: EngineDifficulty) => {
    engineService.changeEngineDifficulty(newDifficulty)
  }

  const handleReset = () => {
    engineService.resetGame()
    setGame(engineService.getGame())
    setSelectedSquare(null)
  }

  const engineInfo = engineService.getEngineInfo()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* En-tête */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Duel de Dame - vs IA</h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-sm text-gray-600">
            Difficulté: <span className="font-medium">{engineInfo.difficulty}</span>
          </div>
          {isEngineThinking && (
            <div className="text-sm text-blue-600 animate-pulse">
              L'IA réfléchit...
            </div>
          )}
        </div>
      </div>

      {/* Plateau de jeu */}
      <div className="mb-6">
        <Board
          game={game}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          currentPlayer={game.getCurrentPlayer()}
        />
      </div>

      {/* Informations de jeu */}
      <div className="mb-6">
        <GameInfo
          game={game}
          currentPlayer={game.getCurrentPlayer()}
          isEngineThinking={isEngineThinking}
        />
      </div>

      {/* Contrôles */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Retour au menu
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Nouvelle partie
        </button>
      </div>

      {/* Sélecteur de difficulté */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Changer la difficulté</h3>
        <div className="flex space-x-2">
          {(['easy', 'medium', 'hard'] as EngineDifficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                difficulty === diff
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {diff === 'easy' ? 'Facile' : diff === 'medium' ? 'Moyen' : 'Difficile'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}