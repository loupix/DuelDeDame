import { Piece } from './Piece';
import { QueenMoveStrategy } from "../strategies/QueenMoveStrategy";
export class Queen extends Piece {
    constructor(color, position) {
        super(color, position, new QueenMoveStrategy());
    }
    getValidMoves(board) {
        return this.moveStrategy.getValidMoves(this, board);
    }
}
//# sourceMappingURL=Queen.js.map