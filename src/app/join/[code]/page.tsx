'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'
import AudioControls from '@/components/AudioControls'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

export default function JoinGame() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
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

  useEffect(() => {
    if (!code || !clientId) return

    const handleJoin = () => {
      console.log('[WS][client][emit][join]', { code })
      socket.emit('join', { code, clientId })
      console.log('[WS][client][emit][ready]', { code })
      socket.emit('ready', code)
    }

    // Auto-join quand on arrive sur cette page
    handleJoin()
  }, [code, clientId])

  useEffect(() => {
    const handleJoined = (data: { code: string; color: 'white' | 'black' }) => {
      console.log('[WS][client][recv][joined]', data)
      setJoined(true)
      setColor(data.color)
      setColorMap(prev => ({ ...prev, [data.code]: data.color }))
      localStorage.setItem('colorMap', JSON.stringify({ ...colorMap, [data.code]: data.color }))
    }

    const handlePlayers = (count: number) => {
      console.log('[WS][client][recv][players]', count)
      setPlayers(count)
    }

    const handleTurn = (turnColor: 'white' | 'black') => {
      console.log('[WS][client][recv][turn]', turnColor)
      setTurn(turnColor)
    }

    const handleFull = () => {
      console.log('[WS][client][recv][full]')
      setError('Cette partie est complète (2 joueurs maximum)')
    }

    const handleError = (error: string) => {
      console.log('[WS][client][recv][error]', error)
      setError(error)
    }

    socket.on('joined', handleJoined)
    socket.on('players', handlePlayers)
    socket.on('turn', handleTurn)
    socket.on('full', handleFull)
    socket.on('error', handleError)

    return () => {
      socket.off('joined', handleJoined)
      socket.off('players', handlePlayers)
      socket.off('turn', handleTurn)
      socket.off('full', handleFull)
      socket.off('error', handleError)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erreur</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Rejoindre la partie</h1>
          <p className="text-white/80 mb-6">Code: <span className="font-mono text-xl">{code}</span></p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 mt-4">Connexion en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Duel de Dame</h1>
            <p className="text-white/80">Partie: {code} • Joueurs: {players}/2</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAudioMenuOpen(!audioMenuOpen)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔊 Audio
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>

        {audioMenuOpen && <AudioControls />}

        <Game
          code={code}
          socket={socket}
          color={color}
          turn={turn}
        />
      </div>
    </div>
  )
}