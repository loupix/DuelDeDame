import { Game } from '@/models/Game'

interface GameInfoProps {
  game: Game
}

export default function GameInfo({ game }: GameInfoProps) {
  const currentPlayer = game.getCurrentPlayer()
  const isWhiteTurn = currentPlayer.getColor() === 'white'

  return (
    <div className="text-center mb-6">
      {/* Indicateur de tour gaming */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-800">
        <div className="flex items-center justify-center space-x-3">
          {/* Icône du joueur actuel */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isWhiteTurn 
              ? 'bg-gradient-to-br from-white to-gray-200 border-2 border-gray-300' 
              : 'bg-gradient-to-br from-slate-800 to-black border-2 border-slate-700'
          } shadow-lg`}>
            <span className="text-xs font-bold">
              {isWhiteTurn ? '⚪' : '⚫'}
            </span>
          </div>
          
          {/* Texte du tour */}
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Tour du joueur
            </h2>
            <p className={`text-sm font-medium ${
              isWhiteTurn ? 'text-slate-200' : 'text-slate-300'
            }`}>
              {isWhiteTurn ? 'Blancs' : 'Noirs'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 