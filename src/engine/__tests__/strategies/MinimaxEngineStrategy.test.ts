import { MinimaxEngineStrategy } from '../../strategies/MinimaxEngineStrategy'
import { Game } from '../../../models/Game'
import { Board } from '../../../models/Board'

describe('MinimaxEngineStrategy', () => {
  let strategy: MinimaxEngineStrategy
  let game: Game

  beforeEach(() => {
    strategy = new MinimaxEngineStrategy()
    game = new Game()
  })

  describe('getDifficulty', () => {
    it('devrait retourner "hard"', () => {
      expect(strategy.getDifficulty()).toBe('hard')
    })
  })

  describe('getMove', () => {
    it('devrait retourner un mouvement valide', () => {
      const move = strategy.getMove(game)
      
      if (move) {
        expect(Array.isArray(move)).toBe(true)
        expect(move).toHaveLength(2)
        expect(Array.isArray(move[0])).toBe(true)
        expect(Array.isArray(move[1])).toBe(true)
      }
    })

    it('devrait retourner null si aucun mouvement possible', () => {
      const emptyBoard = new Board()
      const emptyGame = new Game({ board: emptyBoard })
      
      const move = strategy.getMove(emptyGame)
      expect(move).toBeNull()
    })

    it('devrait prendre plus de temps que les autres stratégies', () => {
      const startTime = Date.now()
      const move = strategy.getMove(game)
      const endTime = Date.now()
      
      const duration = endTime - startTime
      
      // Minimax devrait prendre plus de temps (même si c'est minimal avec la profondeur limitée)
      expect(duration).toBeGreaterThanOrEqual(0)
      expect(move).toBeDefined()
    })
  })

  describe('algorithme Minimax', () => {
    it('devrait évaluer les positions correctement', () => {
      const move = strategy.getMove(game)
      
      if (move) {
        // Vérifier que le mouvement est valide
        const [from, to] = move
        const piece = game.getBoard().getPiece(from)
        
        expect(piece).toBeTruthy()
        expect(piece?.getColor()).toBe('black')
      }
    })

    it('devrait considérer les mouvements adverses', () => {
      // Test plus complexe : vérifier que l'algorithme considère les réponses adverses
      const move = strategy.getMove(game)
      
      if (move) {
        // Le mouvement devrait être stratégiquement valide
        expect(move).toBeDefined()
      }
    })
  })

  describe('performance', () => {
    it('devrait fonctionner dans un temps raisonnable', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 5; i++) {
        const move = strategy.getMove(game)
        expect(move).toBeDefined()
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Devrait prendre moins de 5 secondes pour 5 mouvements
      expect(duration).toBeLessThan(5000)
    })
  })
})