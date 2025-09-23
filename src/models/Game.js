import { Board } from './Board';
import { Player } from './Player';
export class Game {
    board;
    currentPlayer;
    players;
    observers = [];
    constructor(init) {
        this.board = init?.board ?? new Board();
        this.players = init?.players ?? [new Player('white'), new Player('black')];
        this.currentPlayer = init?.currentPlayer ?? this.players[0];
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    notifyObservers() {
        this.observers.forEach(observer => observer(this));
    }
    getBoard() {
        return this.board;
    }
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.players[0]
            ? this.players[1]
            : this.players[0];
        this.notifyObservers();
    }
    movePiece(from, to) {
        const piece = this.board.getPiece(from);
        if (!piece || piece.getColor() !== this.currentPlayer.getColor()) {
            return false;
        }
        if (this.board.movePiece(from, to)) {
            this.switchPlayer();
            return true;
        }
        return false;
    }
    clone() {
        return new Game({
            board: this.board,
            players: this.players,
            currentPlayer: this.currentPlayer
        });
    }
}
//# sourceMappingURL=Game.js.map