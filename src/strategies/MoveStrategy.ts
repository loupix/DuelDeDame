import { Piece } from '@/models/Piece'
import { Board } from '@/models/Board'
import { Position } from '@/models/Piece'
 
export interface MoveStrategy {
  canMove(piece: Piece, to: Position, board: Board): boolean
  getValidMoves(piece: Piece, board: Board): Position[]
} 