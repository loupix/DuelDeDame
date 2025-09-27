import { Game } from '../models/Game'
import { EnginePlayer } from './EnginePlayer'
import { EngineDifficulty } from './factories/EngineStrategyFactory'

export class EngineGameService {
  private game: Game
  private enginePlayer: EnginePlayer
  private humanPlayer: any
  private isEngineTurn: boolean = false

  constructor(difficulty: EngineDifficulty = 'medium') {
    this.enginePlayer = new EnginePlayer('black', difficulty)
    this.humanPlayer = { getColor: () => 'white' } // Joueur humain
    this.game = new Game()
    this.setupGame()
  }

  private setupGame(): void {
    // L'engine joue toujours les noirs, l'humain les blancs
    this.isEngineTurn = false // L'humain commence
  }

  public getGame(): Game {
    return this.game
  }

  public getEnginePlayer(): EnginePlayer {
    return this.enginePlayer
  }

  public isEngineTurnToPlay(): boolean {
    return this.isEngineTurn
  }

  public async makeHumanMove(from: [number, number], to: [number, number]): Promise<boolean> {
    if (this.isEngineTurn) {
      return false // Ce n'est pas le tour de l'humain
    }

    const success = this.game.movePiece(from, to)
    
    if (success) {
      this.isEngineTurn = true
      // L'engine joue automatiquement après le coup humain
      setTimeout(() => this.makeEngineMove(), 100)
    }
    
    return success
  }

  public async makeEngineMove(): Promise<boolean> {
    if (!this.isEngineTurn) {
      return false // Ce n'est pas le tour de l'engine
    }

    try {
      const move = await this.enginePlayer.makeMove(this.game)
      
      if (move) {
        const [from, to] = move
        const success = this.game.movePiece(from, to)
        
        if (success) {
          this.isEngineTurn = false
        }
        
        return success
      }
    } catch (error) {
      console.error('Erreur lors du coup de l\'engine:', error)
    }
    
    return false
  }

  public changeEngineDifficulty(difficulty: EngineDifficulty): void {
    this.enginePlayer.changeDifficulty(difficulty)
  }

  public getEngineInfo(): { difficulty: string, strategy: string, isThinking: boolean } {
    const info = this.enginePlayer.getEngineInfo()
    return {
      ...info,
      isThinking: this.enginePlayer.isEngineThinking()
    }
  }

  public resetGame(): void {
    this.game = new Game()
    this.isEngineTurn = false
    this.setupGame()
  }

  public async isGameOver(): Promise<boolean> {
    // Vérifier si l'engine peut jouer
    if (this.isEngineTurn) {
      const move = await this.enginePlayer.makeMove(this.game)
      return move === null
    }
    
    // Vérifier si l'humain peut jouer
    return this.getAllValidMovesForHuman().length === 0
  }

  private getAllValidMovesForHuman(): [number, number][][] {
    const moves: [number, number][][] = []
    const board = this.game.getBoard()
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece([row, col])
        
        if (piece && piece.getColor() === 'white') {
          const pieceMoves = this.getPieceMoves([row, col])
          moves.push(...pieceMoves)
        }
      }
    }
    
    return moves
  }

  private getPieceMoves(from: [number, number]): [number, number][][] {
    const moves: [number, number][][] = []
    const [fromRow, fromCol] = from
    const piece = this.game.getBoard().getPiece(from)
    
    if (!piece) return moves

    const directions = piece.getType() === 'queen' 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : [[-1, -1], [-1, 1]]

    for (const [deltaRow, deltaCol] of directions) {
      const toRow = fromRow + deltaRow
      const toCol = fromCol + deltaCol
      
      if (this.isValidPosition([toRow, toCol]) && this.canMoveTo(from, [toRow, toCol])) {
        moves.push([from, [toRow, toCol]])
      }

      const captureRow = fromRow + deltaRow * 2
      const captureCol = fromCol + deltaCol * 2
      
      if (this.isValidPosition([captureRow, captureCol]) && this.canCapture(from, [captureRow, captureCol])) {
        moves.push([from, [captureRow, captureCol]])
      }
    }

    return moves
  }

  private isValidPosition(position: [number, number]): boolean {
    const [row, col] = position
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  private canMoveTo(from: [number, number], to: [number, number]): boolean {
    const board = this.game.getBoard()
    const piece = board.getPiece(from)
    const targetPiece = board.getPiece(to)
    
    if (!piece || targetPiece) return false
    
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    
    return rowDiff === colDiff && rowDiff === 1
  }

  private canCapture(from: [number, number], to: [number, number]): boolean {
    const board = this.game.getBoard()
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    
    const captureRow = fromRow + (toRow > fromRow ? 1 : -1)
    const captureCol = fromCol + (toCol > fromCol ? 1 : -1)
    const capturePiece = board.getPiece([captureRow, captureCol])
    
    if (!capturePiece) return false
    
    const piece = board.getPiece(from)
    if (!piece) return false
    
    return capturePiece.getColor() !== piece.getColor()
  }
}