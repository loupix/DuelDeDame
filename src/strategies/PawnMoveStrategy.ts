import { MoveStrategy } from './MoveStrategy'
import { Piece, Position } from '@/models/Piece'
import { Board } from '@/models/Board'

export class PawnMoveStrategy implements MoveStrategy {
  canMove(piece: Piece, to: Position, board: Board): boolean {
    const [fromRow, fromCol] = piece.getPosition()
    const [toRow, toCol] = to
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1

    // Vérifier si le mouvement est dans la bonne direction
    if (toRow - fromRow !== direction) return false

    // Vérifier si le mouvement est en diagonale
    if (Math.abs(toCol - fromCol) !== 1) return false

    // Vérifier si la case de destination est vide
    const targetPiece = board.getPiece(to)
    if (targetPiece) return false

    return true
  }

  canCapture(piece: Piece, to: Position, board: Board): boolean {
    const [fromRow, fromCol] = piece.getPosition()
    const [toRow, toCol] = to
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1

    // Vérifier si le mouvement est dans la bonne direction
    if (toRow - fromRow !== direction * 2) return false

    // Vérifier si le mouvement est en diagonale
    if (Math.abs(toCol - fromCol) !== 2) return false

    // Vérifier la pièce à capturer
    const captureRow = fromRow + direction
    const captureCol = fromCol + (toCol > fromCol ? 1 : -1)
    const capturedPiece = board.getPiece([captureRow, captureCol])

    // Vérifier si la pièce à capturer existe et est de couleur opposée
    if (!capturedPiece || capturedPiece.getColor() === color) return false

    // Vérifier si la case de destination est vide
    const targetPiece = board.getPiece(to)
    if (targetPiece) return false

    return true
  }

  getValidMoves(piece: Piece, board: Board): Position[] {
    const [row, col] = piece.getPosition()
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1
    const validMoves: Position[] = []

    // Mouvements simples
    const simpleMoves: Position[] = [
      [row + direction, col - 1],
      [row + direction, col + 1]
    ]

    // Mouvements de capture
    const captureMoves: Position[] = [
      [row + direction * 2, col - 2],
      [row + direction * 2, col + 2]
    ]

    // Vérifier les mouvements simples
    for (const move of simpleMoves) {
      if (this.canMove(piece, move, board)) {
        validMoves.push(move)
      }
    }

    // Vérifier les mouvements de capture
    for (const move of captureMoves) {
      if (this.canCapture(piece, move, board)) {
        validMoves.push(move)
      }
    }

    return validMoves
  }
} 