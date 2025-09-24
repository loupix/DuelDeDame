'use client'
import { useState, useEffect, useRef } from 'react'
import AudioService from '@/services/AudioService'

interface AudioControlsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AudioControls({ isOpen, onClose }: AudioControlsProps) {
  const [volume, setVolume] = useState(0.7)
  const [muted, setMuted] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true)
    
    // Charger la configuration depuis le service
    const audioService = AudioService.getInstance()
    setVolume(audioService.getVolume())
    setMuted(audioService.isMuted())
    setEnabled(audioService.isEnabled())
  }, [])

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    const audioService = AudioService.getInstance()
    audioService.setVolume(newVolume)
  }

  const handleMuteToggle = () => {
    const newMuted = !muted
    setMuted(newMuted)
    const audioService = AudioService.getInstance()
    audioService.setMuted(newMuted)
  }

  const handleEnabledToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    const audioService = AudioService.getInstance()
    audioService.setEnabled(newEnabled)
  }

  const handleTestSound = () => {
    const audioService = AudioService.getInstance()
    audioService.playNotificationSound()
  }

  if (!isClient || !isOpen) {
    return null
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 border border-slate-700 shadow-2xl z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center">
          <span className="mr-2">🔊</span>
          Audio
        </h3>
        <button
          onClick={handleEnabledToggle}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            enabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {enabled ? 'Activé' : 'Désactivé'}
        </button>
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Contrôle du volume */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMuteToggle}
              className={`p-2 rounded transition-colors ${
                muted
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
              title={muted ? 'Activer le son' : 'Couper le son'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                disabled={muted}
              />
            </div>
          </div>

          {/* Bouton de test */}
          <div className="flex justify-center">
            <button
              onClick={handleTestSound}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors text-sm"
            >
              Tester le son
            </button>
          </div>

          {/* Informations sur les sons */}
          <div className="text-xs text-slate-500 space-y-1">
            <div>• <strong>Mouvement:</strong> Son de clic doux</div>
            <div>• <strong>Capture:</strong> Son plus marqué</div>
            <div>• <strong>Promotion:</strong> Son ascendant</div>
            <div>• <strong>Fin de partie:</strong> Son de victoire</div>
          </div>
        </div>
      )}
    </div>
  )
}