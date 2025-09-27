'use client'
import { useState, useEffect, useRef } from 'react'
import AudioService from '../../services/AudioService'

interface Message {
  id: string
  content: string
  sender: 'white' | 'black' | 'system'
  timestamp: Date
  isPredefined?: boolean
  predefinedColor?: string
}

interface ChatProps {
  socket: any
  color: 'white' | 'black'
  gameCode: string
}

interface ChatBubble {
  id: string
  content: string
  sender: 'white' | 'black' | 'system'
  timestamp: Date
  isPredefined?: boolean
  predefinedColor?: string
  isAnimating: boolean
}

// Messages prédéfinis améliorés pour le jeu de dame
const PREDEFINED_MESSAGES = [
  { id: 'good-game', text: 'Bonne partie !', emoji: '👏', color: 'bg-green-500' },
  { id: 'good-move', text: 'Bien joué !', emoji: '👍', color: 'bg-blue-500' },
  { id: 'nice-capture', text: 'Belle prise !', emoji: '🎯', color: 'bg-red-500' },
  { id: 'oops', text: 'Oups...', emoji: '😅', color: 'bg-yellow-500' },
  { id: 'thinking', text: 'Je réfléchis...', emoji: '🤔', color: 'bg-purple-500' },
  { id: 'lucky', text: 'Chanceux !', emoji: '🍀', color: 'bg-green-400' },
  { id: 'well-played', text: 'Bien joué !', emoji: '🎉', color: 'bg-pink-500' },
  { id: 'almost', text: 'Presque !', emoji: '😤', color: 'bg-orange-500' },
  { id: 'come-on', text: 'Allez !', emoji: '💪', color: 'bg-indigo-500' },
  { id: 'gg', text: 'GG !', emoji: '🏆', color: 'bg-yellow-400' },
  { id: 'rematch', text: 'Revanche ?', emoji: '🔄', color: 'bg-cyan-500' },
  { id: 'gl-hf', text: 'Bonne chance !', emoji: '🍀', color: 'bg-emerald-500' },
  { id: 'checkmate', text: 'Échec et mat !', emoji: '♟️', color: 'bg-red-600' },
  { id: 'stalemate', text: 'Pat !', emoji: '🤝', color: 'bg-gray-500' },
  { id: 'resign', text: 'Je passe !', emoji: '🏳️', color: 'bg-gray-400' },
  { id: 'time-pressure', text: 'Pression temporelle !', emoji: '⏰', color: 'bg-orange-600' }
]

export default function Chat({ socket, color, gameCode }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showPredefined, setShowPredefined] = useState(false)
  const [customMessages, setCustomMessages] = useState<string[]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [personalInput, setPersonalInput] = useState('')
  const [fadingOutBubbles, setFadingOutBubbles] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Charger les messages personnalisés depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('customMessages')
    if (stored) {
      try {
        setCustomMessages(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Sauvegarder les messages personnalisés
  const saveCustomMessages = (messages: string[]) => {
    setCustomMessages(messages)
    localStorage.setItem('customMessages', JSON.stringify(messages))
  }

  useEffect(() => {
    if (!socket) return

    const handleChatMessage = (payload: { 
      message: string
      sender: 'white' | 'black'
      timestamp: string
      isPredefined?: boolean
      predefinedColor?: string
    }) => {
      // Si c'est un message prédéfini mais sans couleur, on la récupère localement
      let predefinedColor = payload.predefinedColor
      if (payload.isPredefined && !predefinedColor) {
        const predefinedMsg = PREDEFINED_MESSAGES.find(msg => 
          payload.message.includes(msg.emoji) && payload.message.includes(msg.text)
        )
        predefinedColor = predefinedMsg?.color
      }

      const newMsg: Message = {
        id: Date.now().toString() + Math.random(),
        content: payload.message,
        sender: payload.sender,
        timestamp: new Date(payload.timestamp),
        isPredefined: payload.isPredefined,
        predefinedColor: predefinedColor
      }
      
      // Debug: vérifier les données reçues
      // console.log('Message reçu:', { 
      //   content: payload.message, 
      //   isPredefined: payload.isPredefined, 
      //   predefinedColor: predefinedColor 
      // })
      setMessages(prev => [...prev, newMsg])

      // Jouer le son de message
      AudioService.getInstance().playChatMessageSound()

      // Créer une bulle animée
      const newBubble: ChatBubble = {
        ...newMsg,
        isAnimating: true
      }
      
      setChatBubbles(prev => {
        const updated = [...prev, newBubble]
        // Garder seulement les 5 derniers messages
        if (updated.length > 5) {
          const oldestBubble = updated[0]
          // Marquer la plus ancienne pour le fadeout
          setFadingOutBubbles(prevFading => new Set([...prevFading, oldestBubble.id]))
          
          // Retirer la bulle après l'animation de fadeout
      setTimeout(() => {
            setChatBubbles(current => current.filter(b => b.id !== oldestBubble.id))
            setFadingOutBubbles(current => {
              const newSet = new Set(current)
              newSet.delete(oldestBubble.id)
              return newSet
            })
          }, 500) // 500ms pour l'animation de fadeout
          
          return updated.slice(1) // Retourner sans la plus ancienne
        }
        return updated
      })

      // Ne plus retirer automatiquement les bulles - garder les 3 derniers
    }

    socket.on('chatMessage', handleChatMessage)

    return () => {
      socket.off('chatMessage', handleChatMessage)
    }
  }, [socket])

  // Charger l'historique des messages depuis l'API
  useEffect(() => {
    if (!gameCode) return
    let isCancelled = false
    const controller = new AbortController()

    const loadHistory = async () => {
      try {
        const res = await fetch(`${apiBase}/chat/history/${gameCode}?limit=200`, { signal: controller.signal })
        if (!res.ok) return
        const data: { id: string; gameCode: string; message: string; sender: 'white' | 'black' | 'system'; isPredefined?: boolean; predefinedColor?: string; timestamp: string }[] = await res.json()
        if (isCancelled) return
        setMessages(prev => {
          if (prev.length > 0) return prev
          return data
            .filter(d => d.sender !== 'system')
            .map(d => ({
            id: d.id,
            content: d.message,
            sender: d.sender,
            timestamp: new Date(d.timestamp),
              isPredefined: d.isPredefined,
              predefinedColor: d.predefinedColor,
          }))
        })
      } catch (_) {
        // ignore
      }
    }

    loadHistory()
    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [apiBase, gameCode])

  const sendMessage = (message: string, isPredefined = false, predefinedColor?: string) => {
    if (!message.trim() || !socket) return

    const messageData = {
      code: gameCode,
      message: message.trim(),
      sender: color,
      timestamp: new Date().toISOString(),
      isPredefined,
      predefinedColor
    }

    socket.emit('chatMessage', messageData)
    setNewMessage('')
    setShowPredefined(false)
    setIsOpen(false) // Fermer le menu après envoi
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(newMessage)
    }
  }

  const handlePredefinedClick = (message: { id: string; text: string; emoji: string; color: string }) => {
    sendMessage(`${message.emoji} ${message.text}`, true, message.color)
  }

  const handleCustomMessageClick = (message: string) => {
    sendMessage(message, false)
  }

  const addCustomMessage = () => {
    if (!newMessage.trim()) return
    
    const updated = [...customMessages, newMessage.trim()]
    saveCustomMessages(updated)
    setNewMessage('')
    setShowCustomInput(false)
  }

  const removeCustomMessage = (index: number) => {
    const updated = customMessages.filter((_, i) => i !== index)
    saveCustomMessages(updated)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getSenderColor = (sender: 'white' | 'black' | 'system') => {
    switch (sender) {
      case 'white': return 'text-blue-400'
      case 'black': return 'text-red-400'
      case 'system': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSenderName = (sender: 'white' | 'black' | 'system') => {
    switch (sender) {
      case 'white': return 'Blanc'
      case 'black': return 'Noir'
      case 'system': return 'Système'
      default: return 'Inconnu'
    }
  }

  return (
    <>
      {/* Bulles de chat flottantes - Position fixe au-dessus du bouton */}
      <div className="fixed bottom-20 right-4 z-40 space-y-2 pointer-events-none">
        {chatBubbles.map((bubble, index) => {
          const isFadingOut = fadingOutBubbles.has(bubble.id)
          return (
          <div
            key={bubble.id}
              className={`transform transition-all duration-500 ease-in-out ${
                isFadingOut 
                  ? 'translate-y-[-20px] opacity-0 scale-95' 
                  : bubble.isAnimating 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-[-100px] opacity-0 scale-95'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateX(${bubble.sender === color ? '0' : '-20px'})`
            }}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow-lg max-w-xs ${
                bubble.predefinedColor && bubble.isPredefined
                  ? `${bubble.predefinedColor} text-white`
                  : bubble.sender === color 
                    ? 'bg-blue-500/80 text-white' 
                    : 'bg-gray-600/80 text-white'
              }`}
            >
              <div className="text-sm font-medium">
                {bubble.sender === color ? 'Toi' : 'Adversaire'}
              </div>
              <div className="text-sm">{bubble.content}</div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Bouton flottant pour ouvrir le chat - Position fixe */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          data-chat-button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Interface du chat */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-96 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 rounded-t-xl border-b border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Messages Rapides
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message personnel - envoi direct */}
            <div className="p-4">
              <label className="block text-xs text-slate-400 mb-1">Message personnel</label>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={personalInput}
                  onChange={(e) => setPersonalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && personalInput.trim()) {
                      sendMessage(personalInput.trim(), false)
                      setPersonalInput('')
                    }
                  }}
                  placeholder="Tape ton message..."
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => { if (personalInput.trim()) { sendMessage(personalInput.trim(), false); setPersonalInput('') } }}
                  disabled={!personalInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm"
                >
                  Envoyer
                </button>
              </div>

              {/* Messages prédéfinis */}
              <div className="border-t border-slate-700 pt-4">
                <div className="text-xs text-slate-400 mb-3 font-medium">Messages prédéfinis :</div>
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1 scroll-thin">
                  {PREDEFINED_MESSAGES.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handlePredefinedClick(msg)}
                      className={`${msg.color} hover:opacity-80 text-white text-xs p-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2`}
                    >
                      <span className="text-lg">{msg.emoji}</span>
                      <span className="font-medium">{msg.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}