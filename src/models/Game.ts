import { Piece } from './Piece'
import { Board } from './Board'
import { Player } from './Player'

export class Game {
  private board: Board
  private currentPlayer: Player
  private players: [Player, Player]
  private observers: ((game: Game) => void)[] = []

  constructor() {
    this.board = new Board()
    this.players = [
      new Player('white'),
      new Player('black')
    ]
    this.currentPlayer = this.players[0]
  }

  public addObserver(observer: (game: Game) => void) {
    this.observers.push(observer)
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this))
  }

  public getBoard(): Board {
    return this.board
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayer
  }

  public switchPlayer() {
    this.currentPlayer = this.currentPlayer === this.players[0] 
      ? this.players[1] 
      : this.players[0]
    this.notifyObservers()
  }

  public movePiece(from: [number, number], to: [number, number]): boolean {
    const piece = this.board.getPiece(from)
    if (!piece || piece.getColor() !== this.currentPlayer.getColor()) {
      return false
    }

    if (this.board.movePiece(from, to)) {
      this.switchPlayer()
      return true
    }

    return false
  }
} 