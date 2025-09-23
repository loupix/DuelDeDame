import { Piece } from './Piece';
import { PawnMoveStrategy } from "../strategies/PawnMoveStrategy";
export class Pawn extends Piece {
    constructor(color, position) {
        super(color, position, new PawnMoveStrategy());
    }
    getValidMoves(board) {
        return this.moveStrategy.getValidMoves(this, board);
    }
}
//# sourceMappingURL=Pawn.js.map