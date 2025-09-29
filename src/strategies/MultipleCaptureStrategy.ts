import { MoveStrategy } from './MoveStrategy'
import { Piece, Position } from '@/models/Piece'
import { Board } from '@/models/Board'

export interface CaptureSequence {
  moves: Position[]
  captures: Position[]
}

export class MultipleCaptureStrategy {
  /**
   * Trouve toutes les séquences de prises possibles pour une pièce
   */
  findCaptureSequences(piece: Piece, board: Board): CaptureSequence[] {
    const sequences: CaptureSequence[] = []
    const visited = new Set<string>()
    
    const findSequencesRecursive = (
      currentPiece: Piece, 
      currentBoard: Board, 
      currentSequence: Position[], 
      currentCaptures: Position[]
    ) => {
      const positionKey = currentPiece.getPosition().join(',')
      if (visited.has(positionKey)) return
      visited.add(positionKey)
      
      const possibleCaptures = this.getPossibleCaptures(currentPiece, currentBoard)
      
      if (possibleCaptures.length === 0) {
        // Fin de séquence
        if (currentCaptures.length > 0) {
          sequences.push({
            moves: [...currentSequence],
            captures: [...currentCaptures]
          })
        }
        return
      }
      
      // Essayer chaque capture possible
      for (const capture of possibleCaptures) {
        const newBoard = currentBoard.clone()
        const newPiece = currentPiece.constructor.name === 'Queen' 
          ? new (currentPiece.constructor as any)(currentPiece.getColor(), capture)
          : new (currentPiece.constructor as any)(currentPiece.getColor(), capture)
        
        // Effectuer la capture
        const capturePosition = this.getCapturePosition(currentPiece.getPosition(), capture)
        newBoard.removePiece(capturePosition)
        newBoard.setPiece(capture, newPiece)
        
        const newSequence = [...currentSequence, capture]
        const newCaptures = [...currentCaptures, capturePosition]
        
        findSequencesRecursive(newPiece, newBoard, newSequence, newCaptures)
      }
    }
    
    findSequencesRecursive(piece, board, [piece.getPosition()], [])
    return sequences
  }
  
  /**
   * Trouve les prises possibles pour une pièce
   */
  getPossibleCaptures(piece: Piece, board: Board): Position[] {
    const captures: Position[] = []
    const [row, col] = piece.getPosition()
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1
    
    // Directions diagonales
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ]
    
    for (const [rowDir, colDir] of directions) {
      const newRow = row + rowDir * 2
      const newCol = col + colDir * 2
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const captureRow = row + rowDir
        const captureCol = col + colDir
        const capturedPiece = board.getPiece([captureRow, captureCol])
        const targetPiece = board.getPiece([newRow, newCol])
        
        // Vérifier si on peut capturer
        if (capturedPiece && 
            capturedPiece.getColor() !== color && 
            !targetPiece) {
          captures.push([newRow, newCol])
        }
      }
    }
    
    return captures
  }
  
  /**
   * Calcule la position de la pièce capturée
   */
  getCapturePosition(from: Position, to: Position): Position {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    
    const rowStep = toRow > fromRow ? 1 : -1
    const colStep = toCol > fromCol ? 1 : -1
    
    return [fromRow + rowStep, fromCol + colStep]
  }
  
  /**
   * Vérifie si des prises multiples sont obligatoires
   */
  hasMandatoryCaptures(piece: Piece, board: Board): boolean {
    const sequences = this.findCaptureSequences(piece, board)
    return sequences.some(seq => seq.captures.length > 1)
  }
  
  /**
   * Retourne les mouvements valides en priorisant les prises multiples
   */
  getValidMovesWithPriority(piece: Piece, board: Board): Position[] {
    const sequences = this.findCaptureSequences(piece, board)
    
    if (sequences.length === 0) {
      // Pas de prises possibles, retourner les mouvements normaux
      return this.getNormalMoves(piece, board)
    }
    
    // Trouver la séquence avec le plus de captures
    const maxCaptures = Math.max(...sequences.map(seq => seq.captures.length))
    const bestSequences = sequences.filter(seq => seq.captures.length === maxCaptures)
    
    // Retourner tous les mouvements de début des meilleures séquences
    const validMoves: Position[] = []
    for (const sequence of bestSequences) {
      if (sequence.moves.length > 1) {
        validMoves.push(sequence.moves[1]) // Premier mouvement de la séquence
      }
    }
    
    return validMoves
  }
  
  /**
   * Mouvements normaux sans prises
   */
  getNormalMoves(piece: Piece, board: Board): Position[] {
    const [row, col] = piece.getPosition()
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1
    const validMoves: Position[] = []
    
    // Mouvements simples en diagonale
    const simpleMoves: Position[] = [
      [row + direction, col - 1],
      [row + direction, col + 1]
    ]
    
    for (const move of simpleMoves) {
      if (this.isValidSimpleMove(piece, move, board)) {
        validMoves.push(move)
      }
    }
    
    return validMoves
  }
  
  /**
   * Vérifie si un mouvement simple est valide
   */
  isValidSimpleMove(piece: Piece, to: Position, board: Board): boolean {
    const [fromRow, fromCol] = piece.getPosition()
    const [toRow, toCol] = to
    const color = piece.getColor()
    const direction = color === 'white' ? -1 : 1
    
    // Vérifier si le mouvement est dans la bonne direction
    if (toRow - fromRow !== direction) return false
    
    // Vérifier si le mouvement est en diagonale
    if (Math.abs(toCol - fromCol) !== 1) return false
    
    // Vérifier si la case de destination est vide
    const targetPiece = board.getPiece(to)
    return !targetPiece
  }
}