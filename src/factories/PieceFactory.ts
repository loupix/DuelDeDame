import { Piece, Position } from '@/models/Piece'
import { Pawn } from '@/models/Pawn'
import { Queen } from '@/models/Queen'

export class PieceFactory {
  public static createPiece(type: 'pawn' | 'queen', color: 'white' | 'black', position: Position): Piece {
    switch (type) {
      case 'pawn':
        return new Pawn(color, position)
      case 'queen':
        return new Queen(color, position)
      default:
        throw new Error(`Type de pièce inconnu: ${type}`)
    }
  }
} 