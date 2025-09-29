'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'
import AudioControls from '@/components/AudioControls'
import Link from 'next/link'

const socketBase = ((): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL
  if (typeof window !== 'undefined' && window.location) {
    return `http://${window.location.hostname}:3001`
  }
  return 'http://localhost:3001'
})()
const socket = io(socketBase)

export default function Home() {
  const safeRandomUUID = (): string => {
    try {
      if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
        return (crypto as any).randomUUID()
      }
      if (typeof crypto !== 'undefined' && (crypto as any).getRandomValues) {
        const bytes = new Uint8Array(16)
        ;(crypto as any).getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        const toHex = (b: number) => b.toString(16).padStart(2, '0')
        const hex = Array.from(bytes, toHex).join('')
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      }
    } catch {}
    return 'u_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  }
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState(false)
  const [players, setPlayers] = useState(1)
  const [error, setError] = useState('')
  const [color, setColor] = useState<string | null>(null)
  const [turn, setTurn] = useState<'white' | 'black' | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [colorMap, setColorMap] = useState<Record<string, 'white' | 'black'>>({})
  const [audioMenuOpen, setAudioMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('clientId')
    if (stored) {
      setClientId(stored)
    } else {
      const cid = safeRandomUUID()
      localStorage.setItem('clientId', cid)
      setClientId(cid)
    }
    const storedColors = localStorage.getItem('colorMap')
    if (storedColors) {
      try { setColorMap(JSON.parse(storedColors)) } catch {}
    }
  }, [])

  const handleJoin = (e: any) => {
    e.preventDefault()
    if (!code || !clientId) return
    console.log('[WS][client][emit][join]', { code })
    socket.emit('join', { code, clientId })
    console.log('[WS][client][emit][ready]', { code })
    socket.emit('ready', code)
  }

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCode(newCode)
    console.log('[WS][client][emit][join]', { code: newCode })
    // Création: ne pas envoyer clientId pour forcer l'attribution d'une nouvelle couleur
    socket.emit('join', { code: newCode })
    console.log('[WS][client][emit][ready]', { code: newCode })
    socket.emit('ready', newCode)
  }

  useEffect(() => {
    const onJoined = (data: { code: string, color: string }) => {
      setJoined(true)
      setError('')
      setCode(data.code)
      setColor(data.color)
      setColorMap(prev => {
        const next = { ...prev, [data.code]: data.color as 'white' | 'black' }
        localStorage.setItem('colorMap', JSON.stringify(next))
        return next
      })
    }
    const onFull = () => { console.log('[WS][client][recv][full]'); setError('Partie pleine !') }
    const onReplaced = () => { console.log('[WS][client][recv][replaced]'); setJoined(false); setPlayers(1); setColor(null); setTurn(null); }
    const onPlayers = (n: number) => { console.log('[WS][client][recv][players]', n); setPlayers(n) }
    const onTurn = (t: 'white' | 'black') => {
      console.log('[WS][client][recv][turn]', t)
      setTurn(t)
    }

    socket.on('joined', onJoined)
    socket.on('full', onFull)
    socket.on('players', onPlayers)
    socket.on('turn', onTurn)
    socket.on('replaced', onReplaced)

    return () => {
      socket.off('joined', onJoined)
      socket.off('full', onFull)
      socket.off('players', onPlayers)
      socket.off('turn', onTurn)
      socket.off('replaced', onReplaced)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-4">
        {!joined ? (
          <div className="max-w-md mx-auto">
            {/* Hero Section Épurée */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-slate-100">
                Prêt pour le Duel ?
              </h2>
              <p className="text-slate-400 mb-12">
                Affrontez vos adversaires dans des parties de dames
              </p>
            </div>

            {/* Interface Épurée */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-8 border border-slate-800">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-100 mb-2">Rejoindre une Partie</h3>
                <p className="text-slate-400 text-sm">Entrez le code de votre adversaire</p>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="Code de partie"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-center font-mono tracking-wider placeholder-slate-500 focus:border-slate-600 focus:outline-none transition-colors"
                    maxLength={6}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
                >
                  Rejoindre
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-slate-700"></div>
                <span className="px-4 text-slate-500 text-sm">ou</span>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>

              <button 
                onClick={handleCreate} 
                className="w-full py-3 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium rounded-lg transition-colors"
              >
                Créer une partie
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-center text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {players === 2 && color ? (
              <div className="space-y-4">
                {/* Barre d'infos gaming stylée */}
                <div className="relative overflow-hidden">
                  {/* Effet de fond gaming avec gradient animé */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  {/* Contenu de la barre */}
                  <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-center gap-8">
                      {/* Couleur du joueur avec style gaming */}
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          color === 'white' 
                            ? 'bg-gradient-to-br from-white to-gray-300 shadow-lg shadow-white/30' 
                            : 'bg-gradient-to-br from-slate-800 to-black shadow-lg shadow-slate-800/30'
                        }`}></div>
                        <span className="text-slate-300 text-sm font-medium">Tu joues</span>
                        <span className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg ${
                          color === 'white' 
                            ? 'bg-gradient-to-r from-white to-gray-200 text-slate-900 shadow-white/20' 
                            : 'bg-gradient-to-r from-slate-800 to-slate-900 text-slate-100 shadow-slate-800/20'
                        }`}>
                          {color === 'white' ? 'BLANCS' : 'NOIRS'}
                        </span>
                      </div>
                      
                      {/* Séparateur gaming */}
                      <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
                      
                      {/* Statut de tour avec effets gaming */}
                      <div className="flex items-center gap-3">
                        {turn === color ? (
                          <>
                            <div className="relative">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
                            </div>
                            <span className="text-green-400 text-sm font-bold tracking-wide">
                              À TOI DE JOUER
                            </span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                          </>
                        ) : (
                          <>
                            <div className="relative">
                              <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-0 w-3 h-3 border border-slate-400 rounded-full animate-pulse opacity-50"></div>
                            </div>
                            <span className="text-slate-400 text-sm font-medium tracking-wide">
                              TOUR DES {turn === 'white' ? 'BLANCS' : 'NOIRS'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Plateau de jeu - Maintenant en pleine largeur */}
                <div className="flex justify-center">
                  <Game code={code} socket={socket} color={color as 'white' | 'black'} turn={turn ?? undefined} />
                </div>
              </div>
            ) : (
              /* En attente d'adversaire - Layout centré */
              <div className="max-w-2xl mx-auto">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-8 border border-slate-800 text-center">
                  <div className="text-xl font-semibold text-slate-100 mb-4">
                    Partie en cours
                  </div>
                  <div className="text-slate-300 mb-4">
                    Code : 
                    <span className="font-mono bg-slate-800 px-2 py-1 rounded ml-2 text-slate-100">
                      {code}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <div className="animate-spin w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full"></div>
                    <span>En attente d'un adversaire...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 