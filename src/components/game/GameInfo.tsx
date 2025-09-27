import { Game } from '@/models/Game'

interface GameInfoProps {
  game: Game
}

export default function GameInfo({ game }: GameInfoProps) {
  const currentPlayer = game.getCurrentPlayer()
  const isWhiteTurn = currentPlayer.getColor() === 'white'

  return (
    <div className="text-center">
      {/* Indicateur de tour compact */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-slate-800">
        <div className="flex items-center justify-center space-x-2">
          {/* Icône du joueur actuel */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isWhiteTurn 
              ? 'bg-gradient-to-br from-white to-gray-200 border border-gray-300' 
              : 'bg-gradient-to-br from-slate-800 to-black border border-slate-700'
          }`}>
            <span className="text-xs">
              {isWhiteTurn ? '⚪' : '⚫'}
            </span>
          </div>
          
          {/* Texte du tour compact */}
          <div>
            <span className="text-sm font-medium text-slate-100">
              Tour des {isWhiteTurn ? 'Blancs' : 'Noirs'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 