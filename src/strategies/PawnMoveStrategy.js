export class PawnMoveStrategy {
    canMove(piece, to, board) {
        const [fromRow, fromCol] = piece.getPosition();
        const [toRow, toCol] = to;
        const color = piece.getColor();
        const direction = color === 'white' ? -1 : 1;
        if (toRow - fromRow !== direction)
            return false;
        if (Math.abs(toCol - fromCol) !== 1)
            return false;
        const targetPiece = board.getPiece(to);
        if (targetPiece)
            return false;
        return true;
    }
    canCapture(piece, to, board) {
        const [fromRow, fromCol] = piece.getPosition();
        const [toRow, toCol] = to;
        const color = piece.getColor();
        const direction = color === 'white' ? -1 : 1;
        if (toRow - fromRow !== direction * 2)
            return false;
        if (Math.abs(toCol - fromCol) !== 2)
            return false;
        const captureRow = fromRow + direction;
        const captureCol = fromCol + (toCol > fromCol ? 1 : -1);
        const capturedPiece = board.getPiece([captureRow, captureCol]);
        if (!capturedPiece || capturedPiece.getColor() === color)
            return false;
        const targetPiece = board.getPiece(to);
        if (targetPiece)
            return false;
        return true;
    }
    getValidMoves(piece, board) {
        const [row, col] = piece.getPosition();
        const color = piece.getColor();
        const direction = color === 'white' ? -1 : 1;
        const validMoves = [];
        const simpleMoves = [
            [row + direction, col - 1],
            [row + direction, col + 1]
        ];
        const captureMoves = [
            [row + direction * 2, col - 2],
            [row + direction * 2, col + 2]
        ];
        for (const move of simpleMoves) {
            if (this.canMove(piece, move, board)) {
                validMoves.push(move);
            }
        }
        for (const move of captureMoves) {
            if (this.canCapture(piece, move, board)) {
                validMoves.push(move);
            }
        }
        return validMoves;
    }
}
//# sourceMappingURL=PawnMoveStrategy.js.map