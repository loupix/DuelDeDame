import { Piece, Position } from './Piece'
import { Board } from './Board'
import { QueenMoveStrategy } from '@/strategies/QueenMoveStrategy'

export class Queen extends Piece {
  constructor(color: 'white' | 'black', position: Position) {
    super(color, position, new QueenMoveStrategy())
  }

  public getValidMoves(board: Board): Position[] {
    return this.moveStrategy.getValidMoves(this, board)
  }
} 