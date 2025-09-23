'use client'
import { useEffect, useState } from 'react'
import { Game as GameModel } from '@/models/Game'
import Board from './Board'
import GameInfo from './GameInfo'

interface GameProps {
  code: string
  socket: any
  color: 'white' | 'black'
  turn?: 'white' | 'black'
}

export default function Game({ code, socket, color, turn }: GameProps) {
  const [game, setGame] = useState(() => new GameModel())
  const [yourTurn, setYourTurn] = useState(false)

  useEffect(() => {
    if (!socket) return
    const handleMove = (payload: { move: { from: [number, number], to: [number, number] }, by?: string }) => {
      console.log('[WS][client][recv][move]', payload)
      // Appliquer le coup reçu et redonner la main
      // Si c'est nous qui venons d'émettre, ignorer (déjà appliqué localement)
      if (payload.by && socket.id && payload.by === socket.id) return
      setGame(prev => {
        const updated = prev.clone()
        updated.movePiece(payload.move.from, payload.move.to)
        return updated
      })
      // Le tour sera mis à jour via l'event 'turn'
    }
    const handleTurn = (turn: 'white' | 'black') => {
      console.log('[WS][client][recv][turn]', turn)
      setYourTurn(turn === color)
    }
    socket.on('move', handleMove)
    socket.on('turn', handleTurn)
    return () => {
      socket.off('move', handleMove)
      socket.off('turn', handleTurn)
    }
  }, [socket, color])

  useEffect(() => {
    if (!turn) return
    setYourTurn(turn === color)
  }, [turn, color])

  const handleMove = (from: [number, number], to: [number, number]) => {
    if (!yourTurn) return
    // Valider et appliquer localement
    setGame(prev => {
      const updated = prev.clone()
      if (updated.movePiece(from, to)) {
        console.log('[WS][client][emit][move]', { code, move: { from, to }, color })
        socket.emit('move', { code, move: { from, to }, color })
        return updated
      }
      return prev
    })
    // Le serveur émettra 'turn'
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <GameInfo game={game} />
      <div className="mb-2 text-lg font-semibold">
        {yourTurn ? 'À toi de jouer !' : 'En attente de ton adversaire...'}
      </div>
      <Board game={game} onMove={yourTurn ? handleMove : undefined} />
    </div>
  )
} 