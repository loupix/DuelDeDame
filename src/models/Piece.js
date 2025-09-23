export class Piece {
    position;
    color;
    moveStrategy;
    constructor(color, position, moveStrategy) {
        this.color = color;
        this.position = position;
        this.moveStrategy = moveStrategy;
    }
    getColor() {
        return this.color;
    }
    getPosition() {
        return this.position;
    }
    setPosition(position) {
        this.position = position;
    }
    canMove(to, board) {
        return this.moveStrategy.canMove(this, to, board);
    }
}
//# sourceMappingURL=Piece.js.map