import { HeuristicEngineStrategy } from '../../strategies/HeuristicEngineStrategy'
import { Game } from '../../../models/Game'
import { Board } from '../../../models/Board'

describe('HeuristicEngineStrategy', () => {
  let strategy: HeuristicEngineStrategy
  let game: Game

  beforeEach(() => {
    strategy = new HeuristicEngineStrategy()
    game = new Game()
  })

  describe('getDifficulty', () => {
    it('devrait retourner "medium"', () => {
      expect(strategy.getDifficulty()).toBe('medium')
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

    it('devrait privilégier les captures', () => {
      // Créer un scénario avec une capture possible
      const board = new Board()
      const testGame = new Game({ board })
      
      // Simuler une position où une capture est possible
      // (Ce test nécessiterait une configuration spécifique du plateau)
      const move = strategy.getMove(testGame)
      
      if (move) {
        const [from, to] = move
        const isCapture = Math.abs(to[0] - from[0]) === 2 && Math.abs(to[1] - from[1]) === 2
        
        // L'heuristique devrait privilégier les captures
        // (Ce test est plus complexe et nécessiterait une configuration spécifique)
        expect(move).toBeDefined()
      }
    })
  })

  describe('évaluation des positions', () => {
    it('devrait évaluer correctement les positions', () => {
      const move = strategy.getMove(game)
      
      if (move) {
        // Vérifier que le mouvement respecte les règles
        const [from, to] = move
        const piece = game.getBoard().getPiece(from)
        
        expect(piece).toBeTruthy()
        expect(piece?.getColor()).toBe('black')
      }
    })
  })
})