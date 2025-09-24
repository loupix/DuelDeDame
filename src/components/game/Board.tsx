'use client'
import { useState } from 'react'
import { Game } from '@/models/Game'
import Square from './Square'

interface BoardProps {
  game: Game
  onMove?: (from: [number, number], to: [number, number]) => void
}

export default function Board({ game, onMove }: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const board = game.getBoard()

  const handleSquareClick = (row: number, col: number) => {
    // Si ce n'est pas votre tour, on ignore toute interaction
    if (!onMove) return
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare
      if (fromRow === row && fromCol === col) {
        setSelectedSquare(null)
        setValidMoves([])
        return
      }
      onMove([fromRow, fromCol], [row, col])
      setSelectedSquare(null)
      setValidMoves([])
    } else {
      const piece = board.getPiece([row, col])
      if (piece && piece.getColor() === game.getCurrentPlayer().getColor()) {
        setSelectedSquare([row, col])
        setValidMoves(piece.getValidMoves(board))
      }
    }
  }

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="relative">
      {/* Plateau 3D Gaming */}
      <div className="relative bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700">
        {/* Bordure du plateau */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-slate-600"></div>
        
        {/* Grille du plateau */}
        <div className="relative grid grid-cols-8 gap-0 bg-slate-800 rounded-lg p-2 shadow-inner">
          {Array(8).fill(null).map((_, row) => (
            Array(8).fill(null).map((_, col) => (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                piece={board.getPiece([row, col])}
                isSelected={selectedSquare?.[0] === row && selectedSquare?.[1] === col}
                isValidMove={isValidMove(row, col)}
                onClick={() => handleSquareClick(row, col)}
              />
            ))
          ))}
        </div>
        
        {/* Effet de profondeur */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-slate-800/40 rounded-xl pointer-events-none"></div>
      </div>
    </div>
  )
} 