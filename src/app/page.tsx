'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'
import AudioControls from '@/components/AudioControls'
import Link from 'next/link'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

export default function Home() {
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
      const cid = crypto.randomUUID()
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
      <div className="container mx-auto px-6 py-16">
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
          <div className="max-w-4xl mx-auto">
            {/* Game Status Épuré */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800 mb-8">
              <div className="text-center">
                <div className="text-xl font-semibold text-slate-100 mb-3">
                  Partie en cours
                </div>
                <div className="text-slate-300 mb-2">
                  Code : 
                  <span className="font-mono bg-slate-800 px-2 py-1 rounded ml-2 text-slate-100">
                    {code}
                  </span>
                </div>
                <div className="text-slate-400">
                  {players < 2 ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full"></div>
                      <span>En attente d'un adversaire...</span>
                    </div>
                  ) : (
                    <div className="text-green-400 font-medium">
                      Les deux joueurs sont connectés
                    </div>
                  )}
                </div>
              </div>
            </div>

            {players === 2 && color && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 border border-slate-800">
                <div className="text-center mb-6">
                  <div className="text-lg font-medium text-slate-100 mb-2">
                    Tu joues les{' '}
                    <span className={`px-3 py-1 rounded font-medium ${
                      color === 'white' 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'bg-slate-800 text-slate-100'
                    }`}>
                      {color === 'white' ? 'Blancs' : 'Noirs'}
                    </span>
                  </div>
                </div>
                <Game code={code} socket={socket} color={color as 'white' | 'black'} turn={turn ?? undefined} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 