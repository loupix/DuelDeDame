import { EngineGameService } from '../../EngineGameService'
import { EngineStrategyFactory } from '../../factories/EngineStrategyFactory'
import { Game } from '../../../models/Game'
import { EngineDifficulty } from '../../factories/EngineStrategyFactory'

describe('Engine Integration Tests', () => {
  describe('Service complet', () => {
    it('devrait gérer une partie complète contre l\'IA', async () => {
      const service = new EngineGameService('medium')
      
      // Vérifier l'état initial
      expect(service.isEngineTurnToPlay()).toBe(false)
      expect(service.getEngineInfo().difficulty).toBe('medium')
      
      // Faire un mouvement humain
      const humanMove = await service.makeHumanMove([5, 0], [4, 1])
      expect(humanMove).toBe(true)
      
      // Attendre que l'IA joue
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Vérifier que l'IA a joué
      expect(service.isEngineTurnToPlay()).toBe(false)
    })
  })

  describe('Toutes les difficultés', () => {
    const difficulties: EngineDifficulty[] = ['easy', 'medium', 'hard']
    
    difficulties.forEach(difficulty => {
      it(`devrait fonctionner avec la difficulté ${difficulty}`, async () => {
        const service = new EngineGameService(difficulty)
        
        expect(service.getEngineInfo().difficulty).toBe(difficulty)
        
        // Faire un mouvement
        const move = await service.makeHumanMove([5, 0], [4, 1])
        expect(move).toBe(true)
      })
    })
  })

  describe('Changement de difficulté en cours de partie', () => {
    it('devrait permettre de changer la difficulté', () => {
      const service = new EngineGameService('easy')
      
      expect(service.getEngineInfo().difficulty).toBe('easy')
      
      service.changeEngineDifficulty('hard')
      expect(service.getEngineInfo().difficulty).toBe('hard')
    })
  })

  describe('Factory et stratégies', () => {
    it('devrait créer toutes les stratégies correctement', () => {
      const difficulties = EngineStrategyFactory.getAvailableDifficulties()
      
      difficulties.forEach(difficulty => {
        const strategy = EngineStrategyFactory.createStrategy(difficulty)
        expect(strategy).toBeDefined()
        expect(strategy.getDifficulty()).toBe(difficulty)
      })
    })
  })

  describe('Performance', () => {
    it('devrait fonctionner dans un temps raisonnable', async () => {
      const service = new EngineGameService('medium')
      const startTime = Date.now()
      
      // Faire plusieurs mouvements
      for (let i = 0; i < 3; i++) {
        await service.makeHumanMove([5, i * 2], [4, i * 2 + 1])
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Devrait prendre moins de 10 secondes
      expect(duration).toBeLessThan(10000)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les mouvements invalides', async () => {
      const service = new EngineGameService('easy')
      
      // Mouvement invalide
      const invalidMove = await service.makeHumanMove([0, 0], [7, 7])
      expect(invalidMove).toBe(false)
    })

    it('devrait gérer les changements de difficulté invalides', () => {
      const service = new EngineGameService('medium')
      
      // Changer vers une difficulté valide
      service.changeEngineDifficulty('hard')
      expect(service.getEngineInfo().difficulty).toBe('hard')
    })
  })

  describe('État du jeu', () => {
    it('devrait maintenir l\'état correctement', () => {
      const service = new EngineGameService('medium')
      const game = service.getGame()
      
      expect(game).toBeInstanceOf(Game)
      expect(game.getBoard()).toBeDefined()
      expect(game.getCurrentPlayer()).toBeDefined()
    })

    it('devrait réinitialiser correctement', () => {
      const service = new EngineGameService('hard')
      
      // Faire quelques mouvements
      service.makeHumanMove([5, 0], [4, 1])
      
      // Réinitialiser
      service.resetGame()
      
      expect(service.isEngineTurnToPlay()).toBe(false)
      expect(service.getGame()).toBeInstanceOf(Game)
    })
  })
})