'use client'
import { useEffect, useState } from 'react'
import { Game as GameModel } from '@/models/Game'
import Board from './Board'
import GameInfo from './GameInfo'
import { GameDataService } from '@/services/GameDataService'

interface GameProps {
  code: string
  socket: any
  color: 'white' | 'black'
  turn?: 'white' | 'black'
}

export default function Game({ code, socket, color, turn }: GameProps) {
  const [game, setGame] = useState(() => new GameModel())
  const [yourTurn, setYourTurn] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const gameDataService = GameDataService.getInstance()

  // Démarrer l'enregistrement de la partie
  useEffect(() => {
    if (!gameStarted && turn) {
      gameDataService.startGame(code, color)
      setGameStarted(true)
    }
  }, [turn, code, color, gameStarted, gameDataService])

  useEffect(() => {
    if (!socket) return
    const handleMove = (payload: { move: { from: [number, number], to: [number, number] }, by?: string }) => {
      console.log('[WS][client][recv][move]', payload)
      // Appliquer le coup reçu et redonner la main
      // Si c'est nous qui venons d'émettre, ignorer (déjà appliqué localement)
      if (payload.by && socket.id && payload.by === socket.id) return
      
      setGame(prev => {
        const updated = prev.clone()
        if (updated.movePiece(payload.move.from, payload.move.to)) {
          // Enregistrer le coup dans le service de données
          const board = updated.getBoard()
          const piece = board.getPiece(payload.move.to)
          const capture = Math.abs(payload.move.to[0] - payload.move.from[0]) === 2 && 
                         Math.abs(payload.move.to[1] - payload.move.from[1]) === 2
          gameDataService.recordMove(
            payload.move.from, 
            payload.move.to, 
            payload.by === socket.id ? color : (color === 'white' ? 'black' : 'white'),
            piece ? piece.constructor.name.toLowerCase() : 'unknown',
            capture
          )
          return updated
        }
        return prev
      })
      // Le tour sera mis à jour via l'event 'turn'
    }
    
    const handleTurn = (turn: 'white' | 'black') => {
      console.log('[WS][client][recv][turn]', turn)
      setYourTurn(turn === color)
    }

    const handleGameEnd = (result: { winner?: 'white' | 'black', reason?: string }) => {
      console.log('[WS][client][recv][gameEnd]', result)
      setGameEnded(true)
      
      // Déterminer le résultat pour le joueur actuel
      let gameResult: 'win' | 'loss' | 'draw' = 'draw'
      if (result.winner) {
        gameResult = result.winner === color ? 'win' : 'loss'
      }
      
      // Terminer l'enregistrement de la partie
      gameDataService.endGame(gameResult, 'Adversaire')
    }

    socket.on('move', handleMove)
    socket.on('turn', handleTurn)
    socket.on('gameEnd', handleGameEnd)
    
    return () => {
      socket.off('move', handleMove)
      socket.off('turn', handleTurn)
      socket.off('gameEnd', handleGameEnd)
    }
  }, [socket, color, gameDataService])

  useEffect(() => {
    if (!turn) return
    setYourTurn(turn === color)
  }, [turn, color])

  const handleMove = (from: [number, number], to: [number, number]) => {
    if (!yourTurn || gameEnded) return
    
    // Valider et appliquer localement
    setGame(prev => {
      const updated = prev.clone()
      if (updated.movePiece(from, to)) {
        console.log('[WS][client][emit][move]', { code, move: { from, to }, color })
        socket.emit('move', { code, move: { from, to }, color })
        
        // Enregistrer le coup
        const board = updated.getBoard()
        const piece = board.getPiece(to)
        const capture = Math.abs(to[0] - from[0]) === 2 && Math.abs(to[1] - from[1]) === 2
        gameDataService.recordMove(from, to, color, piece ? piece.constructor.name.toLowerCase() : 'unknown', capture)
        
        return updated
      }
      return prev
    })
    // Le serveur émettra 'turn'
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <GameInfo game={game} />
      
      {gameEnded ? (
        <div className="text-center">
          <div className="text-xl font-semibold text-green-400 mb-3">Partie terminée !</div>
          <div className="text-slate-300 mb-4">
            La partie a été enregistrée dans vos statistiques
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors"
            >
              Nouvelle partie
            </button>
            <button 
              onClick={() => window.location.href = '/stats'}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium rounded-lg transition-colors"
            >
              Voir les stats
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
            {yourTurn ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">À toi de jouer</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-2 h-2 border-2 border-slate-500 border-t-transparent rounded-full"></div>
                <span className="text-slate-400 text-sm">En attente de l'adversaire</span>
              </div>
            )}
          </div>
          <Board game={game} onMove={yourTurn ? handleMove : undefined} />
        </>
      )}
    </div>
  )
} 