import { Piece } from './Piece'
import { PieceFactory } from '../factories/PieceFactory'

export class Board {
  private grid: (Piece | null)[][]
  private readonly size: number = 8

  constructor() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null))
    this.initializeBoard()
  }

  private initializeBoard() {
    // Placement des pièces noires
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < this.size; col++) {
        if ((row + col) % 2 === 1) {
          this.grid[row][col] = PieceFactory.createPiece('pawn', 'black', [row, col])
        }
      }
    }

    // Placement des pièces blanches
    for (let row = 5; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if ((row + col) % 2 === 1) {
          this.grid[row][col] = PieceFactory.createPiece('pawn', 'white', [row, col])
        }
      }
    }
  }

  public getPiece(position: [number, number]): Piece | null {
    const [row, col] = position
    if (
      row < 0 || row >= this.size ||
      col < 0 || col >= this.size
    ) {
      return null
    }
    return this.grid[row][col]
  }

  public movePiece(from: [number, number], to: [number, number]): boolean {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const piece = this.grid[fromRow][fromCol]

    if (!piece) return false

    // Vérifier si le mouvement est une capture
    const isCapture = Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 2

    if (isCapture) {
      // Calculer la position de la pièce capturée
      const captureRow = fromRow + (toRow > fromRow ? 1 : -1)
      const captureCol = fromCol + (toCol > fromCol ? 1 : -1)
      
      // Supprimer la pièce capturée
      this.grid[captureRow][captureCol] = null
    }

    // Effectuer le mouvement
    this.grid[toRow][toCol] = piece
    this.grid[fromRow][fromCol] = null
    piece.setPosition(to)

    // Vérifier la promotion en dame
    this.checkPromotion(piece, toRow)

    return true
  }

  private checkPromotion(piece: Piece, row: number): void {
    const color = piece.getColor()
    const isPromotionRow = (color === 'white' && row === 0) || (color === 'black' && row === 7)

    if (isPromotionRow) {
      const position = piece.getPosition()
      this.grid[row][position[1]] = PieceFactory.createPiece('queen', color, position)
    }
  }

  public getGrid(): (Piece | null)[][] {
    return this.grid
  }

  public getSize(): number {
    return this.size
  }
} 