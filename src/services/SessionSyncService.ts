/**
 * Service de synchronisation des sessions entre onglets
 * Permet de maintenir la cohérence des clientId et des parties en cours
 */
export class SessionSyncService {
  private static instance: SessionSyncService
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isListening = false

  private constructor() {
    this.startListening()
  }

  static getInstance(): SessionSyncService {
    if (!SessionSyncService.instance) {
      SessionSyncService.instance = new SessionSyncService()
    }
    return SessionSyncService.instance
  }

  /**
   * Démarrer l'écoute des messages de synchronisation
   */
  private startListening(): void {
    if (this.isListening || typeof window === 'undefined') return

    this.isListening = true
    window.addEventListener('storage', this.handleStorageChange.bind(this))
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))
  }

  /**
   * Gérer les changements de localStorage (synchronisation entre onglets)
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'clientId' && event.newValue) {
      this.notifyListeners('clientIdChanged', { clientId: event.newValue })
    } else if (event.key === 'currentGame' && event.newValue) {
      try {
        const gameData = JSON.parse(event.newValue)
        this.notifyListeners('gameSessionChanged', gameData)
      } catch (error) {
        console.error('Erreur lors du parsing de la session de jeu:', error)
      }
    }
  }

  /**
   * Gérer la fermeture de l'onglet
   */
  private handleBeforeUnload(): void {
    // Nettoyer les sessions temporaires si nécessaire
    const currentGame = sessionStorage.getItem('currentGame')
    if (currentGame) {
      // Marquer la session comme fermée
      try {
        const gameData = JSON.parse(currentGame)
        gameData.closed = true
        sessionStorage.setItem('currentGame', JSON.stringify(gameData))
      } catch (error) {
        console.error('Erreur lors de la fermeture de la session:', error)
      }
    }
  }

  /**
   * Notifier les listeners d'un événement
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Erreur dans le listener pour ${event}:`, error)
        }
      })
    }
  }

  /**
   * S'abonner à un événement de synchronisation
   */
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event)!.add(callback)
    
    // Retourner une fonction de désabonnement
    return () => {
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        eventListeners.delete(callback)
        if (eventListeners.size === 0) {
          this.listeners.delete(event)
        }
      }
    }
  }

  /**
   * Synchroniser le clientId entre les onglets
   */
  syncClientId(clientId: string): void {
    if (typeof window === 'undefined') return
    
    const currentClientId = localStorage.getItem('clientId')
    if (currentClientId !== clientId) {
      localStorage.setItem('clientId', clientId)
      console.log('[SESSION_SYNC] ClientId synchronisé:', clientId)
    }
  }

  /**
   * Synchroniser la session de jeu entre les onglets
   */
  syncGameSession(gameData: any): void {
    if (typeof window === 'undefined') return
    
    try {
      const currentGame = sessionStorage.getItem('currentGame')
      if (!currentGame || JSON.stringify(JSON.parse(currentGame)) !== JSON.stringify(gameData)) {
        sessionStorage.setItem('currentGame', JSON.stringify(gameData))
        console.log('[SESSION_SYNC] Session de jeu synchronisée:', gameData)
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la session:', error)
    }
  }

  /**
   * Vérifier si une session de jeu est active dans un autre onglet
   */
  hasActiveGameSession(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const currentGame = sessionStorage.getItem('currentGame')
      if (currentGame) {
        const gameData = JSON.parse(currentGame)
        // Vérifier si la session n'est pas fermée et n'est pas trop ancienne
        const maxAge = 5 * 60 * 1000 // 5 minutes
        return !gameData.closed && (Date.now() - gameData.timestamp < maxAge)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error)
    }
    
    return false
  }

  /**
   * Nettoyer les sessions expirées
   */
  cleanupExpiredSessions(): void {
    if (typeof window === 'undefined') return
    
    try {
      const currentGame = sessionStorage.getItem('currentGame')
      if (currentGame) {
        const gameData = JSON.parse(currentGame)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures
        
        if (Date.now() - gameData.timestamp > maxAge) {
          sessionStorage.removeItem('currentGame')
          console.log('[SESSION_SYNC] Session expirée nettoyée')
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des sessions:', error)
    }
  }

  /**
   * Détruire le service et nettoyer les listeners
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this))
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this))
    }
    
    this.listeners.clear()
    this.isListening = false
  }
}