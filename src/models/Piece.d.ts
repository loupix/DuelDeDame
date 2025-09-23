import { MoveStrategy } from '../strategies/MoveStrategy';
export type Color = 'white' | 'black';
export type Position = [number, number];
export declare abstract class Piece {
    protected position: Position;
    protected color: Color;
    protected moveStrategy: MoveStrategy;
    constructor(color: Color, position: Position, moveStrategy: MoveStrategy);
    getColor(): Color;
    getPosition(): Position;
    setPosition(position: Position): void;
    canMove(to: Position, board: any): boolean;
    abstract getValidMoves(board: any): Position[];
}
