import { Piece } from '@/models/Piece'

interface SquareProps {
  row: number
  col: number
  piece: Piece | null
  isSelected: boolean
  isValidMove: boolean
  onClick: () => void
}

export default function Square({ row, col, piece, isSelected, isValidMove, onClick }: SquareProps) {
  const isDark = (row + col) % 2 === 1
  const bgColor = isDark ? 'bg-gray-700' : 'bg-gray-200'
  const selectedClass = isSelected ? 'ring-2 ring-blue-500' : ''
  const validMoveClass = isValidMove ? 'ring-2 ring-green-500' : ''

  return (
    <div
      className={`w-16 h-16 ${bgColor} ${selectedClass} ${validMoveClass} flex items-center justify-center cursor-pointer relative`}
      onClick={onClick}
    >
      {piece && (
        <div className={`w-12 h-12 rounded-full ${piece.getColor() === 'white' ? 'bg-white' : 'bg-black'} border-2 border-gray-800`} />
      )}
      {isValidMove && !piece && (
        <div className="absolute w-4 h-4 rounded-full bg-green-500 opacity-50" />
      )}
    </div>
  )
} 