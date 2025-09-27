import { Player } from '../models/Player'
import { Game } from '../models/Game'
import { EngineStrategy } from './strategies/EngineStrategy'
import { EngineStrategyFactory, EngineDifficulty } from './factories/EngineStrategyFactory'

export class EnginePlayer extends Player {
  private strategy: EngineStrategy
  private difficulty: EngineDifficulty
  private isThinking: boolean = false

  constructor(color: 'white' | 'black', difficulty: EngineDifficulty = 'medium') {
    super(color)
    this.difficulty = difficulty
    this.strategy = EngineStrategyFactory.createStrategy(difficulty)
  }

  public getDifficulty(): EngineDifficulty {
    return this.difficulty
  }

  public getStrategy(): EngineStrategy {
    return this.strategy
  }

  public isEngineThinking(): boolean {
    return this.isThinking
  }

  public async makeMove(game: Game): Promise<[number, number][] | null> {
    this.isThinking = true
    
    try {
      // Simuler un délai de réflexion (optionnel)
      await this.simulateThinkingDelay()
      
      const move = this.strategy.getMove(game)
      return move
    } finally {
      this.isThinking = false
    }
  }

  private async simulateThinkingDelay(): Promise<void> {
    // Délai variable selon la difficulté
    const delays = {
      easy: 500,    // 0.5 seconde
      medium: 1000, // 1 seconde
      hard: 2000    // 2 secondes
    }
    
    const delay = delays[this.difficulty]
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  public changeDifficulty(newDifficulty: EngineDifficulty): void {
    this.difficulty = newDifficulty
    this.strategy = EngineStrategyFactory.createStrategy(newDifficulty)
  }

  public getEngineInfo(): { difficulty: string, strategy: string } {
    return {
      difficulty: this.difficulty,
      strategy: this.strategy.getDifficulty()
    }
  }
}