import { PieceFactory } from '../factories/PieceFactory';
export class Board {
    grid;
    size = 8;
    constructor() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.initializeBoard();
    }
    initializeBoard() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < this.size; col++) {
                if ((row + col) % 2 === 1) {
                    this.grid[row][col] = PieceFactory.createPiece('pawn', 'black', [row, col]);
                }
            }
        }
        for (let row = 5; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if ((row + col) % 2 === 1) {
                    this.grid[row][col] = PieceFactory.createPiece('pawn', 'white', [row, col]);
                }
            }
        }
    }
    getPiece(position) {
        const [row, col] = position;
        if (row < 0 || row >= this.size ||
            col < 0 || col >= this.size) {
            return null;
        }
        return this.grid[row][col];
    }
    movePiece(from, to) {
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;
        const piece = this.grid[fromRow][fromCol];
        if (!piece)
            return false;
        const isCapture = Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 2;
        if (isCapture) {
            const captureRow = fromRow + (toRow > fromRow ? 1 : -1);
            const captureCol = fromCol + (toCol > fromCol ? 1 : -1);
            this.grid[captureRow][captureCol] = null;
        }
        this.grid[toRow][toCol] = piece;
        this.grid[fromRow][fromCol] = null;
        piece.setPosition(to);
        this.checkPromotion(piece, toRow);
        return true;
    }
    checkPromotion(piece, row) {
        const color = piece.getColor();
        const isPromotionRow = (color === 'white' && row === 0) || (color === 'black' && row === 7);
        if (isPromotionRow) {
            const position = piece.getPosition();
            this.grid[row][position[1]] = PieceFactory.createPiece('queen', color, position);
        }
    }
    getGrid() {
        return this.grid;
    }
    getSize() {
        return this.size;
    }
}
//# sourceMappingURL=Board.js.map