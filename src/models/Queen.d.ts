import { Piece, Position } from './Piece';
import { Board } from './Board';
export declare class Queen extends Piece {
    constructor(color: 'white' | 'black', position: Position);
    getValidMoves(board: Board): Position[];
}
