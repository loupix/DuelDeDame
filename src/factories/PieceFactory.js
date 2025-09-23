import { Pawn } from "../models/Pawn";
import { Queen } from "../models/Queen";
export class PieceFactory {
    static createPiece(type, color, position) {
        switch (type) {
            case 'pawn':
                return new Pawn(color, position);
            case 'queen':
                return new Queen(color, position);
            default:
                throw new Error(`Type de pièce inconnu: ${type}`);
        }
    }
}
//# sourceMappingURL=PieceFactory.js.map