import { MoveStrategy } from './MoveStrategy'
import { Piece, Position } from '@/models/Piece'
import { Board } from '@/models/Board'

export class QueenMoveStrategy implements MoveStrategy {
  canMove(piece: Piece, to: Position, board: Board): boolean {
    const [fromRow, fromCol] = piece.getPosition()
    const [toRow, toCol] = to

    // Vérifier si le mouvement est en diagonale
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false

    // Vérifier si le chemin est libre
    const rowStep = toRow > fromRow ? 1 : -1
    const colStep = toCol > fromCol ? 1 : -1
    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep

    while (currentRow !== toRow && currentCol !== toCol) {
      if (board.getPiece([currentRow, currentCol])) return false
      currentRow += rowStep
      currentCol += colStep
    }

    // Vérifier si la case de destination est vide ou contient une pièce adverse
    const targetPiece = board.getPiece(to)
    if (targetPiece && targetPiece.getColor() === piece.getColor()) return false

    return true
  }

  getValidMoves(piece: Piece, board: Board): Position[] {
    const [row, col] = piece.getPosition()
    const validMoves: Position[] = []
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ]

    for (const [rowDir, colDir] of directions) {
      let currentRow = row + rowDir
      let currentCol = col + colDir

      while (
        currentRow >= 0 && currentRow < 8 &&
        currentCol >= 0 && currentCol < 8
      ) {
        const move: Position = [currentRow, currentCol]
        if (this.canMove(piece, move, board)) {
          validMoves.push(move)
        }
        currentRow += rowDir
        currentCol += colDir
      }
    }

    return validMoves
  }
} 