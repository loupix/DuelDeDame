'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'
import AudioControls from '@/components/AudioControls'
import { GameApiService, GameState } from '@/services/GameApiService'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

export default function GamePage() {
  const params = useParams()
  const code = params.code as string
  
  const [joined, setJoined] = useState(false)
  const [players, setPlayers] = useState(1)
  const [error, setError] = useState('')
  const [color, setColor] = useState<string | null>(null)
  const [turn, setTurn] = useState<'white' | 'black' | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [colorMap, setColorMap] = useState<Record<string, 'white' | 'black'>>({})
  const [audioMenuOpen, setAudioMenuOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [gameLink, setGameLink] = useState('')
  const [gameApiService] = useState(() => GameApiService.getInstance())
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    // Générer le lien de la partie
    const link = `${window.location.origin}/game/${code}`
    setGameLink(link)
    
    // Récupérer ou créer le clientId
    const stored = localStorage.getItem('clientId')
    if (stored) {
      setClientId(stored)
    } else {
      const cid = crypto.randomUUID()
      localStorage.setItem('clientId', cid)
      setClientId(cid)
    }
    
    // Récupérer les couleurs stockées
    const storedColors = localStorage.getItem('colorMap')
    if (storedColors) {
      try { 
        setColorMap(JSON.parse(storedColors)) 
      } catch {}
    }
    
    setIsValidating(false)
  }, [code])

  useEffect(() => {
    if (!clientId || !code) return
    
    const initializeGame = async () => {
      try {
        // D'abord, vérifier l'état de la partie via l'API
        const apiResponse = await gameApiService.getGame(code)
        
        if (apiResponse.success && apiResponse.game) {
          setGameState(apiResponse.game)
          
          // Vérifier si le joueur a déjà rejoint cette partie
          const storedColors = localStorage.getItem('colorMap')
          if (storedColors) {
            try {
              const colorMap = JSON.parse(storedColors)
              if (colorMap[code]) {
                // Le joueur a déjà une couleur pour cette partie
                setColor(colorMap[code])
                setJoined(true)
                console.log('[WS][client][emit][join]', { code })
                socket.emit('join', { code, clientId })
                console.log('[WS][client][emit][ready]', { code })
                socket.emit('ready', code)
                return
              }
            } catch {}
          }
          
          // Essayer de rejoindre la partie via l'API
          const joinResponse = await gameApiService.joinGame(code, clientId)
          if (joinResponse.success && joinResponse.game) {
            setGameState(joinResponse.game)
            console.log('[WS][client][emit][join]', { code })
            socket.emit('join', { code, clientId })
            console.log('[WS][client][emit][ready]', { code })
            socket.emit('ready', code)
          } else {
            setError(joinResponse.error || 'Impossible de rejoindre la partie')
          }
        } else {
          // La partie n'existe pas, essayer de la créer
          const createResponse = await gameApiService.createGame(code, clientId)
          if (createResponse.success && createResponse.game) {
            setGameState(createResponse.game)
            console.log('[WS][client][emit][join]', { code })
            socket.emit('join', { code, clientId })
            console.log('[WS][client][emit][ready]', { code })
            socket.emit('ready', code)
          } else {
            setError(createResponse.error || 'Impossible de créer la partie')
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la partie:', error)
        setError('Erreur de connexion à la base de données')
      }
    }
    
    initializeGame()
  }, [clientId, code, gameApiService])

  useEffect(() => {
    const onJoined = (data: { code: string, color: string }) => {
      if (data.code !== code) return
      setJoined(true)
      setError('')
      setColor(data.color)
      setColorMap(prev => {
        const next = { ...prev, [data.code]: data.color as 'white' | 'black' }
        localStorage.setItem('colorMap', JSON.stringify(next))
        return next
      })
    }
    
    const onFull = () => { 
      console.log('[WS][client][recv][full]')
      setError('Partie pleine !') 
    }
    
    const onReplaced = () => { 
      console.log('[WS][client][recv][replaced]')
      setJoined(false)
      setPlayers(1)
      setColor(null)
      setTurn(null)
    }
    
    const onPlayers = (n: number) => { 
      console.log('[WS][client][recv][players]', n)
      setPlayers(n) 
    }
    
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
  }, [code])

  const copyGameLink = async () => {
    try {
      await navigator.clipboard.writeText(gameLink)
      // Optionnel: afficher une notification de succès
      console.log('Lien copié dans le presse-papiers')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-300">Vérification de la partie...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-4">
        {!joined ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-slate-100">
                Rejoindre la Partie
              </h2>
              <p className="text-slate-400 mb-12">
                Code: <span className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-100">{code}</span>
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-8 border border-slate-800">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-100 mb-2">Connexion en cours</h3>
                <p className="text-slate-400 text-sm">Tentative de rejoindre la partie...</p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-slate-400 mb-6">
                <div className="animate-spin w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full"></div>
                <span>Connexion...</span>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-center text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <div className="text-slate-300 text-sm mb-2">Partager cette partie :</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gameLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm font-mono"
                  />
                  <button
                    onClick={copyGameLink}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 text-sm font-medium rounded transition-colors"
                  >
                    Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {players === 2 && color ? (
              <div className="space-y-4">
                {/* Barre d'infos gaming stylée */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        {/* Couleur du joueur */}
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
                        
                        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
                        
                        {/* Statut de tour */}
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
                      
                      {/* Bouton pour copier le lien */}
                      <button
                        onClick={copyGameLink}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier le lien
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Plateau de jeu */}
                <div className="flex justify-center">
                  <Game code={code} socket={socket} color={color as 'white' | 'black'} turn={turn ?? undefined} />
                </div>
              </div>
            ) : (
              /* En attente d'adversaire */
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
                  <div className="flex items-center justify-center space-x-2 text-slate-400 mb-6">
                    <div className="animate-spin w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full"></div>
                    <span>En attente d'un adversaire...</span>
                  </div>
                  
                  {/* Bouton pour copier le lien */}
                  <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-300 text-sm mb-2">Partager cette partie :</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={gameLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm font-mono"
                      />
                      <button
                        onClick={copyGameLink}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 text-sm font-medium rounded transition-colors"
                      >
                        Copier
                      </button>
                    </div>
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