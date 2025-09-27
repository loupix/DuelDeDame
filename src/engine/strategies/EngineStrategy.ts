import { Game } from '../../models/Game'

export interface EngineStrategy {
  getMove(game: Game): [number, number][] | null
  getDifficulty(): string
}