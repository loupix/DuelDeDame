'use client'

import { useState } from 'react'
import { EngineDifficulty } from '../../engine/factories/EngineStrategyFactory'

interface GameModeSelectorProps {
  onModeSelect: (mode: 'human' | 'engine', difficulty?: EngineDifficulty) => void
}

export default function GameModeSelector({ onModeSelect }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'human' | 'engine'>('human')
  const [selectedDifficulty, setSelectedDifficulty] = useState<EngineDifficulty>('medium')

  const difficulties = [
    { value: 'easy', label: 'Facile', description: 'Mouvements aléatoires' },
    { value: 'medium', label: 'Moyen', description: 'Stratégie heuristique' },
    { value: 'hard', label: 'Difficile', description: 'Algorithme Minimax' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Choisir le mode de jeu</h2>
        
        {/* Mode de jeu */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Mode de jeu</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mode"
                value="human"
                checked={selectedMode === 'human'}
                onChange={(e) => setSelectedMode(e.target.value as 'human')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Contre un ami</div>
                <div className="text-sm text-gray-600">Jouer en ligne avec un autre joueur</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mode"
                value="engine"
                checked={selectedMode === 'engine'}
                onChange={(e) => setSelectedMode(e.target.value as 'engine')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Contre l'ordinateur</div>
                <div className="text-sm text-gray-600">Jouer contre l'intelligence artificielle</div>
              </div>
            </label>
          </div>
        </div>

        {/* Difficulté (seulement pour le mode engine) */}
        {selectedMode === 'engine' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Difficulté</h3>
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <label key={difficulty.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="difficulty"
                    value={difficulty.value}
                    checked={selectedDifficulty === difficulty.value}
                    onChange={(e) => setSelectedDifficulty(e.target.value as EngineDifficulty)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{difficulty.label}</div>
                    <div className="text-sm text-gray-600">{difficulty.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onModeSelect(selectedMode, selectedMode === 'engine' ? selectedDifficulty : undefined)}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Commencer la partie
          </button>
        </div>
      </div>
    </div>
  )
}