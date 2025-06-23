import { Color } from './Piece'

export class Player {
  private color: Color
  private capturedPieces: number = 0

  constructor(color: Color) {
    this.color = color
  }

  public getColor(): Color {
    return this.color
  }

  public incrementCapturedPieces() {
    this.capturedPieces++
  }

  public getCapturedPieces(): number {
    return this.capturedPieces
  }
} 