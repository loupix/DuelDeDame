import { Game } from '@/models/Game'

interface GameInfoProps {
  game: Game
}

export default function GameInfo({ game }: GameInfoProps) {
  const currentPlayer = game.getCurrentPlayer()

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">
        Tour du joueur : {currentPlayer.getColor() === 'white' ? 'Blanc' : 'Noir'}
      </h2>
    </div>
  )
} 