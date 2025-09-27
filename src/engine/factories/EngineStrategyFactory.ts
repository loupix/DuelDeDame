import { EngineStrategy } from '../strategies/EngineStrategy'
import { RandomEngineStrategy } from '../strategies/RandomEngineStrategy'
import { HeuristicEngineStrategy } from '../strategies/HeuristicEngineStrategy'
import { MinimaxEngineStrategy } from '../strategies/MinimaxEngineStrategy'

export type EngineDifficulty = 'easy' | 'medium' | 'hard'

export class EngineStrategyFactory {
  public static createStrategy(difficulty: EngineDifficulty): EngineStrategy {
    switch (difficulty) {
      case 'easy':
        return new RandomEngineStrategy()
      case 'medium':
        return new HeuristicEngineStrategy()
      case 'hard':
        return new MinimaxEngineStrategy()
      default:
        throw new Error(`Difficulté du moteur inconnue: ${difficulty}`)
    }
  }

  public static getAvailableDifficulties(): EngineDifficulty[] {
    return ['easy', 'medium', 'hard']
  }

  public static getDifficultyDescription(difficulty: EngineDifficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'Facile - Mouvements aléatoires'
      case 'medium':
        return 'Moyen - Stratégie heuristique'
      case 'hard':
        return 'Difficile - Algorithme Minimax'
      default:
        return 'Difficulté inconnue'
    }
  }
}