'use client'
import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  content: string
  sender: 'white' | 'black' | 'system'
  timestamp: Date
  isPredefined?: boolean
}

interface ChatProps {
  socket: any
  color: 'white' | 'black'
  gameCode: string
}

// Messages prédéfinis pour le jeu de dame
const PREDEFINED_MESSAGES = [
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
  { id: 'gl-hf', text: 'Bonne chance !', emoji: '🍀' }
]

export default function Chat({ socket, color, gameCode }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showPredefined, setShowPredefined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const handleChatMessage = (payload: { 
      message: string
      sender: 'white' | 'black'
      timestamp: string
      isPredefined?: boolean
    }) => {
      const newMsg: Message = {
        id: Date.now().toString() + Math.random(),
        content: payload.message,
        sender: payload.sender,
        timestamp: new Date(payload.timestamp),
        isPredefined: payload.isPredefined
      }
      setMessages(prev => [...prev, newMsg])
    }

    const handleSystemMessage = (payload: { message: string }) => {
      const newMsg: Message = {
        id: Date.now().toString() + Math.random(),
        content: payload.message,
        sender: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMsg])
    }

    socket.on('chatMessage', handleChatMessage)
    socket.on('systemMessage', handleSystemMessage)

    return () => {
      socket.off('chatMessage', handleChatMessage)
      socket.off('systemMessage', handleSystemMessage)
    }
  }, [socket])

  const sendMessage = (message: string, isPredefined = false) => {
    if (!message.trim() || !socket) return

    const messageData = {
      code: gameCode,
      message: message.trim(),
      sender: color,
      timestamp: new Date().toISOString(),
      isPredefined
    }

    socket.emit('chatMessage', messageData)
    setNewMessage('')
    setShowPredefined(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(newMessage)
    }
  }

  const handlePredefinedClick = (message: { id: string; text: string; emoji: string }) => {
    sendMessage(`${message.emoji} ${message.text}`, true)
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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton pour ouvrir/fermer le chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-colors relative"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {/* Interface du chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
          {/* Header */}
          <div className="bg-slate-800 px-4 py-3 rounded-t-lg border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">
                Aucun message pour le moment
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-medium ${getSenderColor(message.sender)}`}>
                      {getSenderName(message.sender)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isPredefined && (
                      <span className="text-xs text-green-400">⚡</span>
                    )}
                  </div>
                  <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Messages prédéfinis */}
          {showPredefined && (
            <div className="border-t border-slate-700 p-3">
              <div className="text-xs text-slate-400 mb-2">Messages rapides :</div>
              <div className="grid grid-cols-2 gap-2">
                {PREDEFINED_MESSAGES.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handlePredefinedClick(msg)}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs p-2 rounded transition-colors"
                  >
                    {msg.emoji} {msg.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-700 p-3">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setShowPredefined(!showPredefined)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                title="Messages prédéfinis"
              >
                ⚡
              </button>
              <button
                onClick={() => sendMessage(newMessage)}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}