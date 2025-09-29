import { MoveStrategy } from './MoveStrategy'
import { Piece, Position } from '@/models/Piece'
import { Board } from '@/models/Board'

export class QueenMoveStrategy implements MoveStrategy {
  canMove(piece: Piece, to: Position, board: Board): boolean {
    const [fromRow, fromCol] = piece.getPosition()
    const [toRow, toCol] = to

    // Vérifier si le mouvement est en diagonale
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false

    // Vérifier si la case de destination est vide ou contient une pièce adverse
    const targetPiece = board.getPiece(to)
    if (targetPiece && targetPiece.getColor() === piece.getColor()) return false

    // Vérifier le chemin pour les prises
    const rowStep = toRow > fromRow ? 1 : -1
    const colStep = toCol > fromCol ? 1 : -1
    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep
    let piecesInPath = 0
    let lastPiecePosition: Position | null = null

    while (currentRow !== toRow && currentCol !== toCol) {
      const pieceInPath = board.getPiece([currentRow, currentCol])
      if (pieceInPath) {
        piecesInPath++
        lastPiecePosition = [currentRow, currentCol]
      }
      currentRow += rowStep
      currentCol += colStep
    }

    // Si c'est une prise (case de destination occupée par un adversaire)
    if (targetPiece && targetPiece.getColor() !== piece.getColor()) {
      // Pour une prise, il ne doit y avoir qu'une seule pièce adverse sur le chemin
      if (piecesInPath === 1 && lastPiecePosition) {
        const pieceToCapture = board.getPiece(lastPiecePosition)
        return pieceToCapture ? pieceToCapture.getColor() !== piece.getColor() : false
      }
      return false
    }

    // Pour un mouvement simple, le chemin doit être libre
    return piecesInPath === 0
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