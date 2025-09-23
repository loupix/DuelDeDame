import { Piece, Position } from '@/models/Piece';
export declare class PieceFactory {
    static createPiece(type: 'pawn' | 'queen', color: 'white' | 'black', position: Position): Piece;
}
