export interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  averageGameTime: number
  bestStreak: number
  currentStreak: number
  favoriteColor: 'white' | 'black'
  totalPlayTime: number
}

export interface GameRecord {
  id: string
  date: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  color: 'white' | 'black'
  duration: number
  moves: number
  code: string
}

export interface MoveRecord {
  from: [number, number]
  to: [number, number]
  timestamp: number
  player: 'white' | 'black'
  piece: string
  capture?: boolean
  promotion?: boolean
}

export interface GameReplay {
  id: string
  date: string
  duration: number
  moves: MoveRecord[]
  result: 'win' | 'loss' | 'draw'
  color: 'white' | 'black'
  code: string
  highlights: Highlight[]
}

export interface Highlight {
  moveIndex: number
  type: 'brilliant' | 'mistake' | 'blunder' | 'tactical'
  description: string
  score: number
}

export class GameDataService {
  private static instance: GameDataService
  private stats: GameStats
  private gameHistory: GameRecord[]
  private gameReplays: GameReplay[]
  private currentGame: {
    id: string
    startTime: number
    moves: MoveRecord[]
    color: 'white' | 'black'
    code: string
  } | null = null

  constructor() {
    this.stats = this.loadStats()
    this.gameHistory = this.loadGameHistory()
    this.gameReplays = this.loadGameReplays()
    
    // Charger la partie en cours si elle existe
    this.loadCurrentGame()
  }

  static getInstance(): GameDataService {
    if (!GameDataService.instance) {
      GameDataService.instance = new GameDataService()
    }
    return GameDataService.instance
  }

  // Charger les statistiques depuis le localStorage
  private loadStats(): GameStats {
    try {
      const saved = localStorage.getItem('gameStats')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
    
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageGameTime: 0,
      bestStreak: 0,
      currentStreak: 0,
      favoriteColor: 'white',
      totalPlayTime: 0
    }
  }

  // Charger l'historique des parties
  private loadGameHistory(): GameRecord[] {
    try {
      const saved = localStorage.getItem('gameHistory')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
    
    return []
  }

  // Charger les replays
  private loadGameReplays(): GameReplay[] {
    try {
      const saved = localStorage.getItem('gameReplays')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des replays:', error)
    }
    
    return []
  }

  // Sauvegarder les statistiques
  private saveStats(): void {
    try {
      localStorage.setItem('gameStats', JSON.stringify(this.stats))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error)
    }
  }

  // Sauvegarder l'historique
  private saveGameHistory(): void {
    try {
      localStorage.setItem('gameHistory', JSON.stringify(this.gameHistory))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error)
    }
  }

  // Sauvegarder les replays
  private saveGameReplays(): void {
    try {
      localStorage.setItem('gameReplays', JSON.stringify(this.gameReplays))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des replays:', error)
    }
  }

  // Démarrer une nouvelle partie
  startGame(code: string, color: 'white' | 'black'): void {
    this.currentGame = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      moves: [],
      color,
      code
    }
    
    // Sauvegarder la partie en cours
    this.saveCurrentGame()
  }

  // Enregistrer un coup
  recordMove(from: [number, number], to: [number, number], player: 'white' | 'black', piece: string, capture?: boolean, promotion?: boolean): void {
    if (!this.currentGame) return

    const move: MoveRecord = {
      from,
      to,
      timestamp: Date.now(),
      player,
      piece,
      capture,
      promotion
    }

    this.currentGame.moves.push(move)
    
    // Sauvegarder la partie en cours après chaque coup
    this.saveCurrentGame()
  }

  // Terminer une partie
  endGame(result: 'win' | 'loss' | 'draw', opponent: string = 'Inconnu'): void {
    if (!this.currentGame) return

    const duration = Math.floor((Date.now() - this.currentGame.startTime) / 1000)
    
    // Créer l'enregistrement de la partie
    const gameRecord: GameRecord = {
      id: this.currentGame.id,
      date: new Date().toISOString(),
      opponent,
      result,
      color: this.currentGame.color,
      duration,
      moves: this.currentGame.moves.length,
      code: this.currentGame.code
    }

    // Créer le replay
    const gameReplay: GameReplay = {
      id: this.currentGame.id,
      date: new Date().toISOString(),
      duration,
      moves: [...this.currentGame.moves],
      result,
      color: this.currentGame.color,
      code: this.currentGame.code,
      highlights: this.analyzeHighlights(this.currentGame.moves)
    }

    // Mettre à jour les statistiques
    this.updateStats(result, duration)

    // Ajouter à l'historique
    this.gameHistory.unshift(gameRecord)
    this.gameReplays.unshift(gameReplay)

    // Limiter l'historique à 100 parties
    if (this.gameHistory.length > 100) {
      this.gameHistory = this.gameHistory.slice(0, 100)
    }
    if (this.gameReplays.length > 50) {
      this.gameReplays = this.gameReplays.slice(0, 50)
    }

    // Sauvegarder
    this.saveStats()
    this.saveGameHistory()
    this.saveGameReplays()

    // Réinitialiser la partie courante
    this.currentGame = null
    
    // Nettoyer la sauvegarde de la partie en cours
    this.clearCurrentGame()
  }

  // Mettre à jour les statistiques
  private updateStats(result: 'win' | 'loss' | 'draw', duration: number): void {
    this.stats.totalGames++
    
    if (result === 'win') {
      this.stats.wins++
      this.stats.currentStreak = this.stats.currentStreak >= 0 ? this.stats.currentStreak + 1 : 1
    } else if (result === 'loss') {
      this.stats.losses++
      this.stats.currentStreak = this.stats.currentStreak <= 0 ? this.stats.currentStreak - 1 : -1
    } else {
      this.stats.draws++
    }

    // Mettre à jour le taux de victoire
    this.stats.winRate = (this.stats.wins / this.stats.totalGames) * 100

    // Mettre à jour la meilleure série
    if (this.stats.currentStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.currentStreak
    }

    // Mettre à jour le temps de jeu
    this.stats.totalPlayTime += duration
    this.stats.averageGameTime = this.stats.totalPlayTime / this.stats.totalGames

    // Mettre à jour la couleur préférée
    this.updateFavoriteColor()
  }

  // Mettre à jour la couleur préférée
  private updateFavoriteColor(): void {
    const whiteGames = this.gameHistory.filter(game => game.color === 'white')
    const blackGames = this.gameHistory.filter(game => game.color === 'black')
    
    const whiteWinRate = whiteGames.length > 0 ? 
      (whiteGames.filter(game => game.result === 'win').length / whiteGames.length) * 100 : 0
    const blackWinRate = blackGames.length > 0 ? 
      (blackGames.filter(game => game.result === 'win').length / blackGames.length) * 100 : 0

    this.stats.favoriteColor = whiteWinRate > blackWinRate ? 'white' : 'black'
  }

  // Analyser les moments marquants
  private analyzeHighlights(moves: MoveRecord[]): Highlight[] {
    const highlights: Highlight[] = []
    
    // Analyser chaque coup pour détecter des moments intéressants
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]
      
      // Détecter les captures (moments tactiques)
      if (move.capture) {
        highlights.push({
          moveIndex: i,
          type: 'tactical',
          description: `Capture de pièce`,
          score: 1
        })
      }

      // Détecter les promotions (moments brillants)
      if (move.promotion) {
        highlights.push({
          moveIndex: i,
          type: 'brilliant',
          description: `Promotion de pion`,
          score: 3
        })
      }

      // Détecter les erreurs potentielles (simulation basique)
      if (i > 0) {
        const prevMove = moves[i - 1]
        const timeDiff = move.timestamp - prevMove.timestamp
        
        // Coup joué très rapidement (possible erreur)
        if (timeDiff < 2000) {
          highlights.push({
            moveIndex: i,
            type: 'mistake',
            description: `Coup joué rapidement (${Math.floor(timeDiff / 1000)}s)`,
            score: -1
          })
        }
      }
    }

    return highlights.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
  }

  // Getters
  getStats(): GameStats {
    return { ...this.stats }
  }

  getGameHistory(): GameRecord[] {
    return [...this.gameHistory]
  }

  getGameReplays(): GameReplay[] {
    return [...this.gameReplays]
  }

  getCurrentGame() {
    return this.currentGame
  }

  // Obtenir un replay spécifique
  getReplayById(id: string): GameReplay | null {
    return this.gameReplays.find(replay => replay.id === id) || null
  }

  // Obtenir les statistiques d'une période
  getStatsForPeriod(days: number): GameStats {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentGames = this.gameHistory.filter(game => new Date(game.date) >= cutoffDate)
    
    const recentStats: GameStats = {
      totalGames: recentGames.length,
      wins: recentGames.filter(game => game.result === 'win').length,
      losses: recentGames.filter(game => game.result === 'loss').length,
      draws: recentGames.filter(game => game.result === 'draw').length,
      winRate: 0,
      averageGameTime: 0,
      bestStreak: 0,
      currentStreak: 0,
      favoriteColor: 'white',
      totalPlayTime: 0
    }

    if (recentStats.totalGames > 0) {
      recentStats.winRate = (recentStats.wins / recentStats.totalGames) * 100
      recentStats.averageGameTime = recentGames.reduce((sum, game) => sum + game.duration, 0) / recentStats.totalGames
      recentStats.totalPlayTime = recentGames.reduce((sum, game) => sum + game.duration, 0)
    }

    return recentStats
  }

  // Sauvegarder la partie en cours
  private saveCurrentGame(): void {
    if (!this.currentGame) return
    
    try {
      const gameData = {
        ...this.currentGame,
        lastSaved: Date.now()
      }
      sessionStorage.setItem('currentGameData', JSON.stringify(gameData))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la partie en cours:', error)
    }
  }

  // Charger la partie en cours
  loadCurrentGame(): typeof this.currentGame | null {
    try {
      const saved = sessionStorage.getItem('currentGameData')
      if (saved) {
        const gameData = JSON.parse(saved)
        // Vérifier que la partie n'est pas trop ancienne (24h max)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures
        if (Date.now() - gameData.lastSaved < maxAge) {
          this.currentGame = gameData
          return this.currentGame
        } else {
          // Partie trop ancienne, la supprimer
          this.clearCurrentGame()
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la partie en cours:', error)
      this.clearCurrentGame()
    }
    
    return null
  }

  // Nettoyer la sauvegarde de la partie en cours
  private clearCurrentGame(): void {
    try {
      sessionStorage.removeItem('currentGameData')
    } catch (error) {
      console.error('Erreur lors du nettoyage de la partie en cours:', error)
    }
  }

  // Vérifier s'il y a une partie en cours
  hasCurrentGame(): boolean {
    return this.currentGame !== null
  }

  // Obtenir les informations de la partie en cours
  getCurrentGameInfo(): { code: string; color: 'white' | 'black'; moves: number; duration: number } | null {
    if (!this.currentGame) return null
    
    return {
      code: this.currentGame.code,
      color: this.currentGame.color,
      moves: this.currentGame.moves.length,
      duration: Math.floor((Date.now() - this.currentGame.startTime) / 1000)
    }
  }
}