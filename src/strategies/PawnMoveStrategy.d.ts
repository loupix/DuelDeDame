import { MoveStrategy } from './MoveStrategy';
import { Piece, Position } from '@/models/Piece';
import { Board } from '@/models/Board';
export declare class PawnMoveStrategy implements MoveStrategy {
    canMove(piece: Piece, to: Position, board: Board): boolean;
    canCapture(piece: Piece, to: Position, board: Board): boolean;
    getValidMoves(piece: Piece, board: Board): Position[];
}
