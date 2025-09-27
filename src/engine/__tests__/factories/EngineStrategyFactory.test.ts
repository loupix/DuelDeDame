import { EngineStrategyFactory, EngineDifficulty } from '../../factories/EngineStrategyFactory'
import { RandomEngineStrategy } from '../../strategies/RandomEngineStrategy'
import { HeuristicEngineStrategy } from '../../strategies/HeuristicEngineStrategy'
import { MinimaxEngineStrategy } from '../../strategies/MinimaxEngineStrategy'

describe('EngineStrategyFactory', () => {
  describe('createStrategy', () => {
    it('devrait créer une RandomEngineStrategy pour "easy"', () => {
      const strategy = EngineStrategyFactory.createStrategy('easy')
      expect(strategy).toBeInstanceOf(RandomEngineStrategy)
      expect(strategy.getDifficulty()).toBe('easy')
    })

    it('devrait créer une HeuristicEngineStrategy pour "medium"', () => {
      const strategy = EngineStrategyFactory.createStrategy('medium')
      expect(strategy).toBeInstanceOf(HeuristicEngineStrategy)
      expect(strategy.getDifficulty()).toBe('medium')
    })

    it('devrait créer une MinimaxEngineStrategy pour "hard"', () => {
      const strategy = EngineStrategyFactory.createStrategy('hard')
      expect(strategy).toBeInstanceOf(MinimaxEngineStrategy)
      expect(strategy.getDifficulty()).toBe('hard')
    })

    it('devrait lever une erreur pour une difficulté inconnue', () => {
      expect(() => {
        EngineStrategyFactory.createStrategy('unknown' as EngineDifficulty)
      }).toThrow('Difficulté du moteur inconnue: unknown')
    })
  })

  describe('getAvailableDifficulties', () => {
    it('devrait retourner toutes les difficultés disponibles', () => {
      const difficulties = EngineStrategyFactory.getAvailableDifficulties()
      expect(difficulties).toEqual(['easy', 'medium', 'hard'])
      expect(difficulties).toHaveLength(3)
    })
  })

  describe('getDifficultyDescription', () => {
    it('devrait retourner la description pour "easy"', () => {
      const description = EngineStrategyFactory.getDifficultyDescription('easy')
      expect(description).toBe('Facile - Mouvements aléatoires')
    })

    it('devrait retourner la description pour "medium"', () => {
      const description = EngineStrategyFactory.getDifficultyDescription('medium')
      expect(description).toBe('Moyen - Stratégie heuristique')
    })

    it('devrait retourner la description pour "hard"', () => {
      const description = EngineStrategyFactory.getDifficultyDescription('hard')
      expect(description).toBe('Difficile - Algorithme Minimax')
    })

    it('devrait retourner "Difficulté inconnue" pour une difficulté invalide', () => {
      const description = EngineStrategyFactory.getDifficultyDescription('unknown' as EngineDifficulty)
      expect(description).toBe('Difficulté inconnue')
    })
  })

  describe('intégration', () => {
    it('devrait créer des stratégies fonctionnelles', () => {
      const easyStrategy = EngineStrategyFactory.createStrategy('easy')
      const mediumStrategy = EngineStrategyFactory.createStrategy('medium')
      const hardStrategy = EngineStrategyFactory.createStrategy('hard')

      expect(easyStrategy).toBeDefined()
      expect(mediumStrategy).toBeDefined()
      expect(hardStrategy).toBeDefined()

      // Vérifier que toutes les stratégies implémentent l'interface
      expect(typeof easyStrategy.getMove).toBe('function')
      expect(typeof mediumStrategy.getMove).toBe('function')
      expect(typeof hardStrategy.getMove).toBe('function')

      expect(typeof easyStrategy.getDifficulty).toBe('function')
      expect(typeof mediumStrategy.getDifficulty).toBe('function')
      expect(typeof hardStrategy.getDifficulty).toBe('function')
    })
  })
})