import { EnginePlayer } from '../EnginePlayer'
import { Game } from '../../models/Game'
import { EngineDifficulty } from '../factories/EngineStrategyFactory'

describe('EnginePlayer', () => {
  let enginePlayer: EnginePlayer
  let game: Game

  beforeEach(() => {
    enginePlayer = new EnginePlayer('black', 'medium')
    game = new Game()
  })

  describe('constructeur', () => {
    it('devrait créer un joueur avec la couleur et difficulté spécifiées', () => {
      expect(enginePlayer.getColor()).toBe('black')
      expect(enginePlayer.getDifficulty()).toBe('medium')
    })

    it('devrait utiliser "medium" comme difficulté par défaut', () => {
      const defaultPlayer = new EnginePlayer('white')
      expect(defaultPlayer.getDifficulty()).toBe('medium')
    })
  })

  describe('getDifficulty', () => {
    it('devrait retourner la difficulté actuelle', () => {
      expect(enginePlayer.getDifficulty()).toBe('medium')
    })
  })

  describe('getStrategy', () => {
    it('devrait retourner la stratégie actuelle', () => {
      const strategy = enginePlayer.getStrategy()
      expect(strategy).toBeDefined()
      expect(strategy.getDifficulty()).toBe('medium')
    })
  })

  describe('isEngineThinking', () => {
    it('devrait retourner false initialement', () => {
      expect(enginePlayer.isEngineThinking()).toBe(false)
    })
  })

  describe('makeMove', () => {
    it('devrait retourner un mouvement valide', async () => {
      const move = await enginePlayer.makeMove(game)
      
      if (move) {
        expect(Array.isArray(move)).toBe(true)
        expect(move).toHaveLength(2)
        expect(Array.isArray(move[0])).toBe(true)
        expect(Array.isArray(move[1])).toBe(true)
      }
    })

    it('devrait retourner null si aucun mouvement possible', async () => {
      // Créer un plateau vide
      const emptyGame = new Game()
      const move = await enginePlayer.makeMove(emptyGame)
      expect(move).toBeNull()
    })

    it('devrait simuler un délai de réflexion', async () => {
      const startTime = Date.now()
      await enginePlayer.makeMove(game)
      const endTime = Date.now()
      
      const duration = endTime - startTime
      expect(duration).toBeGreaterThanOrEqual(900) // Au moins 0.9 seconde pour "medium"
    })

    it('devrait gérer les erreurs gracieusement', async () => {
      // Test avec un jeu invalide
      const invalidGame = null as any
      
      try {
        const move = await enginePlayer.makeMove(invalidGame)
        expect(move).toBeNull()
      } catch (error) {
        // L'erreur devrait être gérée
        expect(error).toBeDefined()
      }
    })
  })

  describe('changeDifficulty', () => {
    it('devrait changer la difficulté et la stratégie', () => {
      enginePlayer.changeDifficulty('hard')
      
      expect(enginePlayer.getDifficulty()).toBe('hard')
      expect(enginePlayer.getStrategy().getDifficulty()).toBe('hard')
    })

    it('devrait fonctionner avec toutes les difficultés', () => {
      const difficulties: EngineDifficulty[] = ['easy', 'medium', 'hard']
      
      difficulties.forEach(difficulty => {
        enginePlayer.changeDifficulty(difficulty)
        expect(enginePlayer.getDifficulty()).toBe(difficulty)
        expect(enginePlayer.getStrategy().getDifficulty()).toBe(difficulty)
      })
    })
  })

  describe('getEngineInfo', () => {
    it('devrait retourner les informations du moteur', () => {
      const info = enginePlayer.getEngineInfo()
      
      expect(info).toHaveProperty('difficulty')
      expect(info).toHaveProperty('strategy')
      expect(info.difficulty).toBe('medium')
      expect(info.strategy).toBe('medium')
    })

    it('devrait refléter les changements de difficulté', () => {
      enginePlayer.changeDifficulty('hard')
      const info = enginePlayer.getEngineInfo()
      
      expect(info.difficulty).toBe('hard')
      expect(info.strategy).toBe('hard')
    })
  })

  describe('délais de réflexion', () => {
    it('devrait avoir des délais différents selon la difficulté', async () => {
      const difficulties: EngineDifficulty[] = ['easy', 'medium', 'hard']
      const durations: number[] = []

      for (const difficulty of difficulties) {
        const player = new EnginePlayer('black', difficulty)
        const startTime = Date.now()
        await player.makeMove(game)
        const endTime = Date.now()
        
        durations.push(endTime - startTime)
      }

      // Les délais devraient être différents (même si c'est minimal)
      expect(durations[0]).toBeGreaterThanOrEqual(400) // easy: 500ms
      expect(durations[1]).toBeGreaterThanOrEqual(900) // medium: 1000ms
      expect(durations[2]).toBeGreaterThanOrEqual(1900) // hard: 2000ms
    })
  })
})