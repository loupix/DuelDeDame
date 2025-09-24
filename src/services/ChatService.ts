export interface ChatMessage {
  id: string
  content: string
  sender: 'white' | 'black' | 'system'
  timestamp: Date
  isPredefined?: boolean
}

export interface ChatServiceConfig {
  maxMessages: number
  autoScroll: boolean
  soundEnabled: boolean
}

class ChatService {
  private static instance: ChatService
  private messages: ChatMessage[] = []
  private config: ChatServiceConfig = {
    maxMessages: 100,
    autoScroll: true,
    soundEnabled: true
  }
  private listeners: ((messages: ChatMessage[]) => void)[] = []

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  // Ajouter un message
  addMessage(message: Omit<ChatMessage, 'id'>): void {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    this.messages.push(newMessage)

    // Limiter le nombre de messages
    if (this.messages.length > this.config.maxMessages) {
      this.messages = this.messages.slice(-this.config.maxMessages)
    }

    // Notifier les listeners
    this.notifyListeners()

    // Son de notification (optionnel)
    if (this.config.soundEnabled && message.sender !== 'system') {
      this.playNotificationSound()
    }
  }

  // Obtenir tous les messages
  getMessages(): ChatMessage[] {
    return [...this.messages]
  }

  // Effacer tous les messages
  clearMessages(): void {
    this.messages = []
    this.notifyListeners()
  }

  // Ajouter un listener pour les changements de messages
  addListener(listener: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(listener)
    
    // Retourner une fonction pour supprimer le listener
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notifier tous les listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getMessages()))
  }

  // Configuration
  updateConfig(newConfig: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ChatServiceConfig {
    return { ...this.config }
  }

  // Son de notification
  private playNotificationSound(): void {
    try {
      // Créer un son simple pour la notification
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Impossible de jouer le son de notification:', error)
    }
  }

  // Messages prédéfinis pour le jeu de dame
  static getPredefinedMessages() {
    return [
      { id: 'good-game', text: 'Bonne partie !', emoji: '👏' },
      { id: 'good-move', text: 'Bien joué !', emoji: '👍' },
      { id: 'nice-capture', text: 'Belle prise !', emoji: '🎯' },
      { id: 'oops', text: 'Oups...', emoji: '😅' },
      { id: 'thinking', text: 'Je réfléchis...', emoji: '🤔' },
      { id: 'lucky', text: 'Chanceux !', emoji: '🍀' },
      { id: 'well-played', text: 'Bien joué !', emoji: '🎉' },
      { id: 'almost', text: 'Presque !', emoji: '😤' },
      { id: 'come-on', text: 'Allez !', emoji: '💪' },
      { id: 'gg', text: 'GG !', emoji: '🏆' },
      { id: 'rematch', text: 'Revanche ?', emoji: '🔄' },
      { id: 'gl-hf', text: 'Bonne chance !', emoji: '🍀' },
      { id: 'checkmate', text: 'Échec et mat !', emoji: '♟️' },
      { id: 'stalemate', text: 'Pat !', emoji: '🤝' },
      { id: 'resign', text: 'Je passe !', emoji: '🏳️' },
      { id: 'time-pressure', text: 'Pression temporelle !', emoji: '⏰' }
    ]
  }

  // Messages système prédéfinis
  static getSystemMessages() {
    return {
      gameStarted: 'La partie a commencé !',
      gameEnded: 'La partie est terminée.',
      playerJoined: (player: string) => `${player} a rejoint la partie.`,
      playerLeft: (player: string) => `${player} a quitté la partie.`,
      turnChanged: (player: string) => `C'est au tour de ${player}.`,
      pieceCaptured: (piece: string) => `${piece} a été capturé !`,
      kingPromoted: 'Un pion est devenu dame !'
    }
  }
}

export default ChatService