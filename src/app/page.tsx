'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
// Log basique des connexions
socket.on('connect', () => console.log('[WS][client][connect]', { socketId: socket.id }))
socket.on('disconnect', (reason) => console.log('[WS][client][disconnect]', { reason }))

export default function Home() {
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState(false)
  const [players, setPlayers] = useState(1)
  const [error, setError] = useState('')
  const [color, setColor] = useState<string | null>(null)
  const [turn, setTurn] = useState<'white' | 'black' | null>(null)

  const handleJoin = (e: any) => {
    e.preventDefault()
    if (!code) return
    console.log('[WS][client][emit][join]', { code })
    socket.emit('join', code)
    console.log('[WS][client][emit][ready]', { code })
    socket.emit('ready', code)
  }

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCode(newCode)
    console.log('[WS][client][emit][join]', { code: newCode })
    socket.emit('join', newCode)
    console.log('[WS][client][emit][ready]', { code: newCode })
    socket.emit('ready', newCode)
  }

  useEffect(() => {
    const onJoined = (data: { code: string, color: string }) => {
      console.log('[WS][client][recv][joined]', data)
      setJoined(true)
      setError('')
      setCode(data.code)
      setColor(data.color)
    }
    const onFull = () => { console.log('[WS][client][recv][full]'); setError('Partie pleine !') }
    const onPlayers = (n: number) => { console.log('[WS][client][recv][players]', n); setPlayers(n) }
    const onTurn = (t: 'white' | 'black') => {
      console.log('[WS][client][recv][turn]', t)
      setTurn(t)
    }

    socket.on('joined', onJoined)
    socket.on('full', onFull)
    socket.on('players', onPlayers)
    socket.on('turn', onTurn)

    return () => {
      socket.off('joined', onJoined)
      socket.off('full', onFull)
      socket.off('players', onPlayers)
      socket.off('turn', onTurn)
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