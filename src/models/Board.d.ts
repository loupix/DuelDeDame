import { Piece } from './Piece';
export declare class Board {
    private grid;
    private readonly size;
    constructor();
    private initializeBoard;
    getPiece(position: [number, number]): Piece | null;
    movePiece(from: [number, number], to: [number, number]): boolean;
    private checkPromotion;
    getGrid(): (Piece | null)[][];
    getSize(): number;
}
