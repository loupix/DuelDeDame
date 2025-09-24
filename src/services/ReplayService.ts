/**
 * Service pour récupérer les replays depuis l'API
 */
export interface GameReplayData {
  game: {
    id: string
    code: string
    status: string
    winner: 'white' | 'black' | null
    moveCount: number
    duration: number
    whitePlayerName: string
    blackPlayerName: string
    createdAt: string
    updatedAt: string
  }
  moves: Array<{
    id: string
    player: 'white' | 'black'
    from: [number, number]
    to: [number, number]
    piece: string
    isCapture: boolean
    isPromotion: boolean
    moveNumber: number
    notation: string
    timestamp: string
  }>
}

export interface GameStats {
  totalGames: number
  finishedGames: number
  whiteWins: number
  blackWins: number
  averageDuration: number
  averageMoves: number
}

export interface RecentGame {
  id: string
  code: string
  status: string
  winner: 'white' | 'black' | null
  moveCount: number
  duration: number
  whitePlayerName: string
  blackPlayerName: string
  createdAt: string
  updatedAt: string
}

export class ReplayService {
  private static instance: ReplayService
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  static getInstance(): ReplayService {
    if (!ReplayService.instance) {
      ReplayService.instance = new ReplayService()
    }
    return ReplayService.instance
  }

  /**
   * Récupérer un replay de partie par son code
   */
  async getGameReplay(code: string): Promise<GameReplayData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/replay/${code}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération du replay')
      }

      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération du replay:', error)
      return null
    }
  }

  /**
   * Récupérer les parties récentes
   */
  async getRecentGames(limit: number = 10): Promise<RecentGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/recent?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des parties récentes')
      }

      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des parties récentes:', error)
      return []
    }
  }

  /**
   * Récupérer les parties d'un joueur
   */
  async getPlayerGames(playerId: string, limit: number = 10): Promise<RecentGame[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/player/${playerId}?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des parties du joueur')
      }

      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des parties du joueur:', error)
      return []
    }
  }

  /**
   * Récupérer les statistiques globales
   */
  async getGameStats(): Promise<GameStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/stats`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des statistiques')
      }

      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return null
    }
  }

  /**
   * Convertir un replay de l'API vers le format du GameDataService
   */
  convertToGameDataServiceFormat(replayData: GameReplayData): any {
    return {
      id: replayData.game.id,
      date: replayData.game.createdAt,
      duration: replayData.game.duration,
      moves: replayData.moves.map(move => ({
        from: move.from,
        to: move.to,
        timestamp: new Date(move.timestamp).getTime(),
        player: move.player,
        piece: move.piece,
        capture: move.isCapture,
        promotion: move.isPromotion
      })),
      result: replayData.game.winner ? 
        (replayData.game.winner === 'white' ? 'win' : 'loss') : 'draw',
      color: 'white', // À déterminer selon le contexte
      code: replayData.game.code,
      highlights: [] // À implémenter si nécessaire
    }
  }

  /**
   * Vérifier si l'API est disponible
   */
  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/stats`, {
        method: 'HEAD'
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}