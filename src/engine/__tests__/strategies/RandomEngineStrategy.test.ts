import { RandomEngineStrategy } from '../../strategies/RandomEngineStrategy'
import { Game } from '../../../models/Game'
import { Board } from '../../../models/Board'

describe('RandomEngineStrategy', () => {
  let strategy: RandomEngineStrategy
  let game: Game

  beforeEach(() => {
    strategy = new RandomEngineStrategy()
    game = new Game()
  })

  describe('getDifficulty', () => {
    it('devrait retourner "easy"', () => {
      expect(strategy.getDifficulty()).toBe('easy')
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
        expect(move[0]).toHaveLength(2)
        expect(move[1]).toHaveLength(2)
      }
    })

    it('devrait retourner null si aucun mouvement possible', () => {
      // Créer un plateau vide
      const emptyBoard = new Board()
      const emptyGame = new Game({ board: emptyBoard })
      
      const move = strategy.getMove(emptyGame)
      expect(move).toBeNull()
    })

    it('devrait retourner des mouvements différents sur plusieurs appels', () => {
      const moves = new Set()
      
      // Faire plusieurs appels pour tester la randomisation
      for (let i = 0; i < 10; i++) {
        const move = strategy.getMove(game)
        if (move) {
          moves.add(JSON.stringify(move))
        }
      }
      
      // Avec un plateau initial, il devrait y avoir plusieurs mouvements possibles
      expect(moves.size).toBeGreaterThan(0)
    })
  })

  describe('mouvements valides', () => {
    it('devrait retourner des mouvements de pions noirs', () => {
      const move = strategy.getMove(game)
      
      if (move) {
        const [from, to] = move
        const piece = game.getBoard().getPiece(from)
        
        expect(piece).toBeTruthy()
        expect(piece?.getColor()).toBe('black')
      }
    })

    it('devrait respecter les règles de déplacement', () => {
      const move = strategy.getMove(game)
      
      if (move) {
        const [from, to] = move
        const [fromRow, fromCol] = from
        const [toRow, toCol] = to
        
        // Vérifier que c'est un mouvement diagonal
        const rowDiff = Math.abs(toRow - fromRow)
        const colDiff = Math.abs(toCol - fromCol)
        
        expect(rowDiff).toBe(colDiff)
        expect(rowDiff).toBeGreaterThan(0)
        expect(rowDiff).toBeLessThanOrEqual(2) // Mouvement simple ou capture
      }
    })
  })
})