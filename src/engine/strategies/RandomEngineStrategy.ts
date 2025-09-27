import { Game } from '../../models/Game'
import { EngineStrategy } from './EngineStrategy'

export class RandomEngineStrategy implements EngineStrategy {
  private difficulty: string = 'easy'

  getMove(game: Game): [number, number][] | null {
    const validMoves = this.getAllValidMoves(game)
    
    if (validMoves.length === 0) {
      return null
    }

    // Choisir un mouvement aléatoire
    const randomIndex = Math.floor(Math.random() * validMoves.length)
    return validMoves[randomIndex]
  }

  getDifficulty(): string {
    return this.difficulty
  }

  private getAllValidMoves(game: Game): [number, number][][] {
    const moves: [number, number][][] = []
    const board = game.getBoard()
    const currentPlayer = game.getCurrentPlayer()
    
    // Parcourir toutes les cases du plateau
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece([row, col])
        
        if (piece && piece.getColor() === currentPlayer.getColor()) {
          // Trouver tous les mouvements possibles pour cette pièce
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

    // Directions de mouvement pour les pions
    const directions = piece.getType() === 'queen' 
      ? this.getQueenDirections(piece.getColor())
      : this.getPawnDirections(piece.getColor())

    for (const [deltaRow, deltaCol] of directions) {
      // Mouvement simple
      const toRow = fromRow + deltaRow
      const toCol = fromCol + deltaCol
      
      if (this.isValidPosition([toRow, toCol]) && this.canMoveTo(game, from, [toRow, toCol])) {
        moves.push([from, [toRow, toCol]])
      }

      // Capture
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
      ? [[-1, -1], [-1, 1]]  // Blancs vers le haut
      : [[1, -1], [1, 1]]    // Noirs vers le bas
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
    
    // Vérifier que c'est un mouvement diagonal
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
    
    // Position de la pièce à capturer
    const captureRow = fromRow + (toRow > fromRow ? 1 : -1)
    const captureCol = fromCol + (toCol > fromCol ? 1 : -1)
    const capturePiece = board.getPiece([captureRow, captureCol])
    
    if (!capturePiece) return false
    
    const piece = board.getPiece(from)
    if (!piece) return false
    
    // Vérifier que c'est une pièce adverse
    return capturePiece.getColor() !== piece.getColor()
  }
}