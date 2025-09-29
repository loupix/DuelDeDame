import { MoveStrategy } from './MoveStrategy'
import { Piece, Position } from '@/models/Piece'
import { Board } from '@/models/Board'
import { MultipleCaptureStrategy } from './MultipleCaptureStrategy'

export class PawnMoveStrategy implements MoveStrategy {
  private multipleCaptureStrategy = new MultipleCaptureStrategy()

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
    // Utiliser la stratégie de prises multiples pour prioriser les captures
    return this.multipleCaptureStrategy.getValidMovesWithPriority(piece, board)
  }
} 