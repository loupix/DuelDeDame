export class Player {
    color;
    capturedPieces = 0;
    constructor(color) {
        this.color = color;
    }
    getColor() {
        return this.color;
    }
    incrementCapturedPieces() {
        this.capturedPieces++;
    }
    getCapturedPieces() {
        return this.capturedPieces;
    }
}
//# sourceMappingURL=Player.js.map