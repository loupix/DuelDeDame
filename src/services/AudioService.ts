export type SoundType = 
  | 'move'           // Déplacement de pièce
  | 'capture'        // Capture de pièce
  | 'promotion'      // Promotion en dame
  | 'gameStart'      // Début de partie
  | 'gameEnd'        // Fin de partie
  | 'turn'           // Changement de tour
  | 'error'          // Erreur de mouvement
  | 'notification'   // Notification générale

interface AudioConfig {
  volume: number
  muted: boolean
  enabled: boolean
}

class AudioService {
  private static instance: AudioService
  private audioContext: AudioContext | null = null
  private config: AudioConfig = {
    volume: 0.7,
    muted: false,
    enabled: true
  }

  private constructor() {
    this.initializeAudioContext()
    this.loadConfig()
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  private initializeAudioContext(): void {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API non supporté:', error)
    }
  }

  // Génération de sons programmatiques (Web Audio API)
  private generateMoveSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  private generateCaptureSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.5 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  private generatePromotionSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // Son ascendant pour la promotion
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.6 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  private generateGameStartSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.4 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  private generateGameEndSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // Son de victoire
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.7 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  private generateTurnSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05)
    
    gainNode.gain.setValueAtTime(0.2 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.05)
  }

  private generateErrorSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.4 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  private generateNotificationSound(): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3 * this.config.volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  public playSound(soundType: SoundType): void {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return
    if (!this.config.enabled || this.config.muted || !this.audioContext) return
    
    // Reprendre le contexte audio si nécessaire
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    switch (soundType) {
      case 'move':
        this.generateMoveSound()
        break
      case 'capture':
        this.generateCaptureSound()
        break
      case 'promotion':
        this.generatePromotionSound()
        break
      case 'gameStart':
        this.generateGameStartSound()
        break
      case 'gameEnd':
        this.generateGameEndSound()
        break
      case 'turn':
        this.generateTurnSound()
        break
      case 'error':
        this.generateErrorSound()
        break
      case 'notification':
        this.generateNotificationSound()
        break
    }
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume))
    this.saveConfig()
  }

  public getVolume(): number {
    return this.config.volume
  }

  public setMuted(muted: boolean): void {
    this.config.muted = muted
    this.saveConfig()
  }

  public isMuted(): boolean {
    return this.config.muted
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    this.saveConfig()
  }

  public isEnabled(): boolean {
    return this.config.enabled
  }

  private loadConfig(): void {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('audioConfig')
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement de la configuration audio:', error)
    }
  }

  private saveConfig(): void {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('audioConfig', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de la configuration audio:', error)
    }
  }

  // Méthodes de convenance pour les événements de jeu
  public playMoveSound(): void {
    this.playSound('move')
  }

  public playCaptureSound(): void {
    this.playSound('capture')
  }

  public playPromotionSound(): void {
    this.playSound('promotion')
  }

  public playGameStartSound(): void {
    this.playSound('gameStart')
  }

  public playGameEndSound(): void {
    this.playSound('gameEnd')
  }

  public playTurnSound(): void {
    this.playSound('turn')
  }

  public playErrorSound(): void {
    this.playSound('error')
  }

  public playNotificationSound(): void {
    this.playSound('notification')
  }
}

export default AudioService