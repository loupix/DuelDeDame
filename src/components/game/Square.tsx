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
  
  // Design gaming des cases
  const bgColor = isDark 
    ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
    : 'bg-gradient-to-br from-slate-200 to-slate-300'
  
  const selectedClass = isSelected 
    ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/50 scale-105' 
    : ''
  
  const validMoveClass = isValidMove 
    ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/50' 
    : ''

  return (
    <div
      className={`w-16 h-16 ${bgColor} ${selectedClass} ${validMoveClass} flex items-center justify-center cursor-pointer relative transition-all duration-200 hover:scale-105 hover:shadow-lg`}
      onClick={onClick}
    >
      {/* Effet de profondeur pour les cases */}
      <div className={`absolute inset-0 rounded-sm ${isDark ? 'bg-gradient-to-br from-slate-600/50 to-transparent' : 'bg-gradient-to-br from-white/30 to-transparent'}`}></div>
      
      {piece && (
        <GamingPiece piece={piece} />
      )}
      
      {isValidMove && !piece && (
        <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 animate-pulse" />
      )}
    </div>
  )
}

// Composant pour les pions gaming 3D
function GamingPiece({ piece }: { piece: Piece }) {
  const isWhite = piece.getColor() === 'white'
  const pieceType = piece.constructor.name.toLowerCase()
  
  return (
    <div className="relative">
      {/* Ombre du pion */}
      <div className={`absolute inset-0 w-12 h-12 rounded-full ${isWhite ? 'bg-slate-400' : 'bg-slate-900'} transform translate-y-1 opacity-30`}></div>
      
      {/* Corps principal du pion */}
      <div className={`relative w-12 h-12 rounded-full ${
        isWhite 
          ? 'bg-gradient-to-br from-white via-gray-100 to-gray-200' 
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black'
      } shadow-lg border-2 ${
        isWhite ? 'border-gray-300' : 'border-slate-700'
      }`}>
        
        {/* Reflet sur le pion */}
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full ${
          isWhite 
            ? 'bg-gradient-to-br from-white to-transparent' 
            : 'bg-gradient-to-br from-slate-600 to-transparent'
        } opacity-60`}></div>
        
        {/* Indicateur de type de pion */}
        {pieceType === 'queen' && (
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isWhite ? 'bg-yellow-400' : 'bg-yellow-600'
          } shadow-sm`}></div>
        )}
        
        {/* Effet de brillance */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  )
} 