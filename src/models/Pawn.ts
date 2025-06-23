import { Piece, Position } from './Piece'
import { Board } from './Board'
import { PawnMoveStrategy } from '@/strategies/PawnMoveStrategy'

export class Pawn extends Piece {
  constructor(color: 'white' | 'black', position: Position) {
    super(color, position, new PawnMoveStrategy())
  }

  public getValidMoves(board: Board): Position[] {
    return this.moveStrategy.getValidMoves(this, board)
  }
} 