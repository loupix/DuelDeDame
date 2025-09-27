import { MoveStrategy } from '../strategies/MoveStrategy'

export type Color = 'white' | 'black'
export type Position = [number, number]

export abstract class Piece {
  protected position: Position
  protected color: Color
  protected moveStrategy: MoveStrategy

  constructor(color: Color, position: Position, moveStrategy: MoveStrategy) {
    this.color = color
    this.position = position
    this.moveStrategy = moveStrategy
  }

  public getColor(): Color {
    return this.color
  }

  public getPosition(): Position {
    return this.position
  }

  public setPosition(position: Position) {
    this.position = position
  }

  public canMove(to: Position, board: any): boolean {
    return this.moveStrategy.canMove(this, to, board)
  }

  public abstract getValidMoves(board: any): Position[]
  
  public abstract getType(): string
} 