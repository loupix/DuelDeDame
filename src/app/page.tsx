'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'

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
    socket.emit('join', { code, clientId })
    socket.emit('ready', code)
  }

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCode(newCode)
    // Création: ne pas envoyer clientId pour forcer l'attribution d'une nouvelle couleur
    socket.emit('join', { code: newCode })
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
    const onFull = () => { setError('Partie pleine !') }
    const onReplaced = () => { setJoined(false); setPlayers(1); setColor(null); setTurn(null); }
    const onPlayers = (n: number) => { setPlayers(n) }
    const onTurn = (t: 'white' | 'black') => { setTurn(t) }

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Duel de Dame</h1>
      {!joined ? (
        <div className="flex flex-col items-center gap-4">
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Code de partie"
              className="border px-2 py-1 rounded"
              maxLength={6}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Rejoindre</button>
          </form>
          <span>ou</span>
          <button onClick={handleCreate} className="bg-green-500 text-white px-4 py-1 rounded">Créer une partie</button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg">Code de la partie : <span className="font-mono bg-gray-200 px-2 py-1 rounded">{code}</span></div>
          <div>{players < 2 ? 'En attente d’un autre joueur...' : 'Les deux joueurs sont connectés !'}</div>
          {players === 2 && color && (
            <>
              <div className="mb-2">Tu joues les <span className={color === 'white' ? 'text-gray-700' : 'text-black bg-white px-2 rounded'}>{color === 'white' ? 'blancs' : 'noirs'}</span></div>
              <Game code={code} socket={socket} color={color as 'white' | 'black'} turn={turn ?? undefined} />
            </>
          )}
        </div>
      )}
    </div>
  )
} 