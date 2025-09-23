import { Board } from './Board';
import { Player } from './Player';
type GameInit = {
    board?: Board;
    players?: [Player, Player];
    currentPlayer?: Player;
};
export declare class Game {
    private board;
    private currentPlayer;
    private players;
    private observers;
    constructor(init?: GameInit);
    addObserver(observer: (game: Game) => void): void;
    private notifyObservers;
    getBoard(): Board;
    getCurrentPlayer(): Player;
    switchPlayer(): void;
    movePiece(from: [number, number], to: [number, number]): boolean;
    clone(): Game;
}
export {};
