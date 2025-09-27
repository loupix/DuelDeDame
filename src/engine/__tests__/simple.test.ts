// Test simple pour vérifier que Jest fonctionne
describe('Engine Tests', () => {
  it('devrait fonctionner', () => {
    expect(1 + 1).toBe(2)
  })

  it('devrait tester les stratégies de base', () => {
    const strategies = ['easy', 'medium', 'hard']
    expect(strategies).toHaveLength(3)
    expect(strategies).toContain('easy')
    expect(strategies).toContain('medium')
    expect(strategies).toContain('hard')
  })

  it('devrait tester les types de pièces', () => {
    const pieceTypes = ['pawn', 'queen']
    expect(pieceTypes).toHaveLength(2)
    expect(pieceTypes).toContain('pawn')
    expect(pieceTypes).toContain('queen')
  })
})