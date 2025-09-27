import { Game } from '../../models/Game'
import { EngineStrategy } from './EngineStrategy'

export class HeuristicEngineStrategy implements EngineStrategy {
  private difficulty: string = 'medium'

  getMove(game: Game): [number, number][] | null {
    const validMoves = this.getAllValidMoves(game)
    
    if (validMoves.length === 0) {
      return null
    }

    // Évaluer tous les mouvements et choisir le meilleur
    let bestMove: [number, number][] | null = null
    let bestScore = -Infinity

    for (const move of validMoves) {
      const score = this.evaluateMove(game, move)
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

  private evaluateMove(game: Game, move: [number, number][]): number {
    const [from, to] = move
    let score = 0

    // 1. Priorité aux captures (score très élevé)
    if (this.isCapture(game, from, to)) {
      score += 1000
      
      // Bonus si on capture une dame
      const capturedPiece = this.getCapturedPiece(game, from, to)
      if (capturedPiece && capturedPiece.getType() === 'queen') {
        score += 500
      }
    }

    // 2. Contrôle du centre
    const centerBonus = this.getCenterControlBonus(to)
    score += centerBonus

    // 3. Avancement des pions
    const advancementBonus = this.getAdvancementBonus(game, to)
    score += advancementBonus

    // 4. Protection des pièces
    const protectionBonus = this.getProtectionBonus(game, to)
    score += protectionBonus

    // 5. Éviter les pièges
    const trapPenalty = this.getTrapPenalty(game, to)
    score -= trapPenalty

    return score
  }

  private isCapture(game: Game, from: [number, number], to: [number, number]): boolean {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    return Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 2
  }

  private getCapturedPiece(game: Game, from: [number, number], to: [number, number]): any {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const captureRow = fromRow + (toRow > fromRow ? 1 : -1)
    const captureCol = fromCol + (toCol > fromCol ? 1 : -1)
    return game.getBoard().getPiece([captureRow, captureCol])
  }

  private getCenterControlBonus(position: [number, number]): number {
    const [row, col] = position
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5)
    return Math.max(0, 10 - centerDistance)
  }

  private getAdvancementBonus(game: Game, position: [number, number]): number {
    const [row, col] = position
    const piece = game.getBoard().getPiece(position)
    if (!piece) return 0

    const currentPlayer = game.getCurrentPlayer()
    const isWhite = currentPlayer.getColor() === 'white'
    
    if (isWhite) {
      return (7 - row) * 2 // Plus on avance, plus c'est bon
    } else {
      return row * 2
    }
  }

  private getProtectionBonus(game: Game, position: [number, number]): number {
    // Vérifier si la pièce sera protégée par d'autres pièces
    const [row, col] = position
    let protectionCount = 0
    
    // Vérifier les cases adjacentes pour des pièces alliées
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (const [deltaRow, deltaCol] of directions) {
      const checkRow = row + deltaRow
      const checkCol = col + deltaCol
      
      if (this.isValidPosition([checkRow, checkCol])) {
        const piece = game.getBoard().getPiece([checkRow, checkCol])
        if (piece && piece.getColor() === game.getCurrentPlayer().getColor()) {
          protectionCount++
        }
      }
    }
    
    return protectionCount * 5
  }

  private getTrapPenalty(game: Game, position: [number, number]): number {
    // Vérifier si la pièce sera en danger
    const [row, col] = position
    let dangerCount = 0
    
    // Vérifier les cases adjacentes pour des pièces ennemies
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (const [deltaRow, deltaCol] of directions) {
      const checkRow = row + deltaRow
      const checkCol = col + deltaCol
      
      if (this.isValidPosition([checkRow, checkCol])) {
        const piece = game.getBoard().getPiece([checkRow, checkCol])
        if (piece && piece.getColor() !== game.getCurrentPlayer().getColor()) {
          dangerCount++
        }
      }
    }
    
    return dangerCount * 10
  }

  private isValidPosition(position: [number, number]): boolean {
    const [row, col] = position
    return row >= 0 && row < 8 && col >= 0 && col < 8
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