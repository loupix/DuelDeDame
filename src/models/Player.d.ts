import { Color } from './Piece';
export declare class Player {
    private color;
    private capturedPieces;
    constructor(color: Color);
    getColor(): Color;
    incrementCapturedPieces(): void;
    getCapturedPieces(): number;
}
