import { Game } from '../../models/Game'
import { EngineStrategy } from './EngineStrategy'

export class MinimaxEngineStrategy implements EngineStrategy {
  private difficulty: string = 'hard'
  private maxDepth: number = 4

  getMove(game: Game): [number, number][] | null {
    const validMoves = this.getAllValidMoves(game)
    
    if (validMoves.length === 0) {
      return null
    }

    let bestMove: [number, number][] | null = null
    let bestScore = -Infinity

    for (const move of validMoves) {
      // Simuler le mouvement
      const gameCopy = game.clone()
      const [from, to] = move
      gameCopy.movePiece(from, to)
      
      // Évaluer avec minimax
      const score = this.minimax(gameCopy, this.maxDepth - 1, false)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  getDifficulty(): string {
    return this.difficulty
  }

  private minimax(game: Game, depth: number, isMaximizing: boolean): number {
    // Condition d'arrêt
    if (depth === 0 || this.isGameOver(game)) {
      return this.evaluatePosition(game)
    }

    const validMoves = this.getAllValidMoves(game)
    
    if (isMaximizing) {
      let maxScore = -Infinity
      
      for (const move of validMoves) {
        const gameCopy = game.clone()
        const [from, to] = move
        gameCopy.movePiece(from, to)
        
        const score = this.minimax(gameCopy, depth - 1, false)
        maxScore = Math.max(maxScore, score)
      }
      
      return maxScore
    } else {
      let minScore = Infinity
      
      for (const move of validMoves) {
        const gameCopy = game.clone()
        const [from, to] = move
        gameCopy.movePiece(from, to)
        
        const score = this.minimax(gameCopy, depth - 1, true)
        minScore = Math.min(minScore, score)
      }
      
      return minScore
    }
  }

  private evaluatePosition(game: Game): number {
    const board = game.getBoard()
    const currentPlayer = game.getCurrentPlayer()
    let score = 0

    // Évaluer chaque pièce sur le plateau
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece([row, col])
        
        if (piece) {
          const pieceValue = this.getPieceValue(piece)
          const positionValue = this.getPositionValue([row, col], piece.getType())
          const mobilityValue = this.getMobilityValue(game, [row, col])
          
          const totalValue = pieceValue + positionValue + mobilityValue
          
          // Ajouter ou soustraire selon la couleur
          if (piece.getColor() === currentPlayer.getColor()) {
            score += totalValue
          } else {
            score -= totalValue
          }
        }
      }
    }

    return score
  }

  private getPieceValue(piece: any): number {
    switch (piece.getType()) {
      case 'pawn': return 100
      case 'queen': return 300
      default: return 0
    }
  }

  private getPositionValue(position: [number, number], pieceType: string): number {
    const [row, col] = position
    
    if (pieceType === 'pawn') {
      // Les pions sont plus précieux au centre et en avançant
      const centerBonus = this.getCenterBonus(row, col)
      const advancementBonus = this.getAdvancementBonus(row)
      return centerBonus + advancementBonus
    } else if (pieceType === 'queen') {
      // Les dames sont plus précieuses au centre
      return this.getCenterBonus(row, col) * 2
    }
    
    return 0
  }

  private getCenterBonus(row: number, col: number): number {
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5)
    return Math.max(0, 10 - centerDistance)
  }

  private getAdvancementBonus(row: number): number {
    // Les pions sont plus précieux quand ils avancent
    return row * 2
  }

  private getMobilityValue(game: Game, position: [number, number]): number {
    const moves = this.getPieceMoves(game, position)
    return moves.length * 5 // Bonus pour la mobilité
  }

  private isGameOver(game: Game): boolean {
    const validMoves = this.getAllValidMoves(game)
    return validMoves.length === 0
  }

  private getAllValidMoves(game: Game): [number, number][][] {
    const moves: [number, number][][] = []
    const board = game.getBoard()
    const currentPlayer = game.getCurrentPlayer()
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece([row, col])
        
        if (piece && piece.getColor() === currentPlayer.getColor()) {
          const pieceMoves = this.getPieceMoves(game, [row, col])
          moves.push(...pieceMoves)
        }
      }
    }
    
    return moves
  }

  private getPieceMoves(game: Game, from: [number, number]): [number, number][][] {
    const moves: [number, number][][] = []
    const [fromRow, fromCol] = from
    const piece = game.getBoard().getPiece(from)
    
    if (!piece) return moves

    const directions = piece.getType() === 'queen' 
      ? this.getQueenDirections(piece.getColor())
      : this.getPawnDirections(piece.getColor())

    for (const [deltaRow, deltaCol] of directions) {
      const toRow = fromRow + deltaRow
      const toCol = fromCol + deltaCol
      
      if (this.isValidPosition([toRow, toCol]) && this.canMoveTo(game, from, [toRow, toCol])) {
        moves.push([from, [toRow, toCol]])
      }

      const captureRow = fromRow + deltaRow * 2
      const captureCol = fromCol + deltaCol * 2
      
      if (this.isValidPosition([captureRow, captureCol]) && this.canCapture(game, from, [captureRow, captureCol])) {
        moves.push([from, [captureRow, captureCol]])
      }
    }

    return moves
  }

  private getPawnDirections(color: string): [number, number][] {
    return color === 'white' 
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]]
  }

  private getQueenDirections(color: string): [number, number][] {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }

  private isValidPosition(position: [number, number]): boolean {
    const [row, col] = position
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  private canMoveTo(game: Game, from: [number, number], to: [number, number]): boolean {
    const board = game.getBoard()
    const piece = board.getPiece(from)
    const targetPiece = board.getPiece(to)
    
    if (!piece || targetPiece) return false
    
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    
    return rowDiff === colDiff && rowDiff === 1
  }

  private canCapture(game: Game, from: [number, number], to: [number, number]): boolean {
    const board = game.getBoard()
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