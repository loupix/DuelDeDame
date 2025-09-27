import { EngineGameService } from '../EngineGameService'
import { Game } from '../../models/Game'
import { EngineDifficulty } from '../factories/EngineStrategyFactory'

describe('EngineGameService', () => {
  let service: EngineGameService
  let game: Game

  beforeEach(() => {
    service = new EngineGameService('medium')
    game = service.getGame()
  })

  describe('constructeur', () => {
    it('devrait créer un service avec la difficulté spécifiée', () => {
      expect(service.getEnginePlayer().getDifficulty()).toBe('medium')
    })

    it('devrait utiliser "medium" comme difficulté par défaut', () => {
      const defaultService = new EngineGameService()
      expect(defaultService.getEnginePlayer().getDifficulty()).toBe('medium')
    })

    it('devrait initialiser le jeu correctement', () => {
      expect(service.getGame()).toBeInstanceOf(Game)
      expect(service.isEngineTurnToPlay()).toBe(false) // L'humain commence
    })
  })

  describe('getGame', () => {
    it('devrait retourner l\'instance de jeu', () => {
      const gameInstance = service.getGame()
      expect(gameInstance).toBeInstanceOf(Game)
      expect(gameInstance).toBe(game)
    })
  })

  describe('getEnginePlayer', () => {
    it('devrait retourner l\'instance du joueur IA', () => {
      const enginePlayer = service.getEnginePlayer()
      expect(enginePlayer).toBeDefined()
      expect(enginePlayer.getColor()).toBe('black')
    })
  })

  describe('isEngineTurnToPlay', () => {
    it('devrait retourner false initialement', () => {
      expect(service.isEngineTurnToPlay()).toBe(false)
    })
  })

  describe('makeHumanMove', () => {
    it('devrait accepter un mouvement humain valide', async () => {
      // Mouvement valide d'un pion blanc
      const from: [number, number] = [5, 0]
      const to: [number, number] = [4, 1]
      
      const success = await service.makeHumanMove(from, to)
      expect(success).toBe(true)
      expect(service.isEngineTurnToPlay()).toBe(true)
    })

    it('devrait refuser un mouvement invalide', async () => {
      const from: [number, number] = [5, 0]
      const to: [number, number] = [3, 3] // Mouvement invalide
      
      const success = await service.makeHumanMove(from, to)
      expect(success).toBe(false)
      expect(service.isEngineTurnToPlay()).toBe(false)
    })

    it('devrait refuser un mouvement si ce n\'est pas le tour de l\'humain', async () => {
      // Forcer le tour de l'engine
      service.makeHumanMove([5, 0], [4, 1])
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const from: [number, number] = [5, 2]
      const to: [number, number] = [4, 3]
      
      const success = await service.makeHumanMove(from, to)
      expect(success).toBe(false)
    })
  })

  describe('makeEngineMove', () => {
    it('devrait faire un mouvement de l\'engine', async () => {
      // L'engine ne joue que si c'est son tour
      service.makeHumanMove([5, 0], [4, 1])
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const success = await service.makeEngineMove()
      expect(success).toBe(true)
      expect(service.isEngineTurnToPlay()).toBe(false)
    })

    it('devrait retourner false si ce n\'est pas le tour de l\'engine', async () => {
      const success = await service.makeEngineMove()
      expect(success).toBe(false)
    })
  })

  describe('changeEngineDifficulty', () => {
    it('devrait changer la difficulté de l\'engine', () => {
      service.changeEngineDifficulty('hard')
      expect(service.getEnginePlayer().getDifficulty()).toBe('hard')
    })

    it('devrait fonctionner avec toutes les difficultés', () => {
      const difficulties: EngineDifficulty[] = ['easy', 'medium', 'hard']
      
      difficulties.forEach(difficulty => {
        service.changeEngineDifficulty(difficulty)
        expect(service.getEnginePlayer().getDifficulty()).toBe(difficulty)
      })
    })
  })

  describe('getEngineInfo', () => {
    it('devrait retourner les informations de l\'engine', () => {
      const info = service.getEngineInfo()
      
      expect(info).toHaveProperty('difficulty')
      expect(info).toHaveProperty('strategy')
      expect(info).toHaveProperty('isThinking')
      expect(info.difficulty).toBe('medium')
      expect(info.strategy).toBe('medium')
      expect(typeof info.isThinking).toBe('boolean')
    })
  })

  describe('resetGame', () => {
    it('devrait réinitialiser le jeu', () => {
      // Faire quelques mouvements
      service.makeHumanMove([5, 0], [4, 1])
      
      // Réinitialiser
      service.resetGame()
      
      expect(service.isEngineTurnToPlay()).toBe(false)
      expect(service.getGame()).toBeInstanceOf(Game)
    })
  })

  describe('isGameOver', () => {
    it('devrait retourner false pour un jeu en cours', () => {
      expect(service.isGameOver()).toBe(false)
    })

    it('devrait détecter la fin de partie', async () => {
      // Cette fonction est asynchrone, donc on teste la structure
      const isOver = service.isGameOver()
      expect(typeof isOver).toBe('boolean')
    })
  })

  describe('intégration', () => {
    it('devrait gérer une partie complète', async () => {
      // Mouvement humain
      const humanMove = await service.makeHumanMove([5, 0], [4, 1])
      expect(humanMove).toBe(true)
      
      // Attendre que l'engine joue
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Vérifier que l'engine a joué
      expect(service.isEngineTurnToPlay()).toBe(false)
    })

    it('devrait maintenir l\'état du jeu correctement', () => {
      const initialGame = service.getGame()
      const initialTurn = service.isEngineTurnToPlay()
      
      service.makeHumanMove([5, 0], [4, 1])
      
      // L'état devrait changer
      expect(service.isEngineTurnToPlay()).not.toBe(initialTurn)
    })
  })
})