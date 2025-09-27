'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Game from '@/components/game/Game'
import AudioControls from '@/components/AudioControls'
import Notification from '@/components/Notification'
import { useNotification } from '@/hooks/useNotification'
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
  const { notifications, removeNotification, showSuccess } = useNotification()

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
              /* En attente d'adversaire - Interface ergonomique améliorée */
              <div className="max-w-3xl mx-auto">
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center shadow-2xl">
                  {/* Header avec animation et code mis en évidence */}
                  <div className="mb-8">
                    <div className="text-3xl font-bold text-slate-100 mb-4 flex items-center justify-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      Partie en cours
                    </div>
                    
                    {/* Code de la partie - Design amélioré */}
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600/50 mb-6">
                      <div className="text-slate-400 text-sm mb-2">Code de la partie</div>
                      <div className="font-mono text-2xl font-bold text-slate-100 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-600/30 tracking-wider">
                        {code}
                      </div>
                    </div>
                  </div>

                  {/* Animation d'attente avec design amélioré */}
                  <div className="flex items-center justify-center space-x-4 text-slate-300 mb-10">
                    <div className="relative">
                      <div className="animate-spin w-8 h-8 border-3 border-slate-500 border-t-blue-500 rounded-full"></div>
                      <div className="absolute inset-0 w-8 h-8 border border-blue-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-slate-200">En attente d'un adversaire...</div>
                      <div className="text-slate-400 text-sm mt-1">Partagez le lien ci-dessous pour inviter quelqu'un</div>
                    </div>
                  </div>
                  
                  {/* Bouton principal - Design ergonomique amélioré */}
                  <div className="space-y-6">
                    <button
                      onClick={() => {
                        const gameLink = `${window.location.origin}/game/${code}`
                        navigator.clipboard.writeText(gameLink).then(() => {
                          showSuccess('✅ Lien copié ! Partagez-le avec votre adversaire')
                        }).catch(err => {
                          console.error('Erreur lors de la copie:', err)
                          showSuccess('✅ Lien copié ! Partagez-le avec votre adversaire')
                        })
                      }}
                      className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-lg">Copier le lien de la partie</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </button>
                    
                    {/* Options de partage - Design amélioré */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          const gameLink = `${window.location.origin}/game/${code}`
                          const subject = encodeURIComponent('Rejoins ma partie de Duel de Dame !')
                          const body = encodeURIComponent(`Salut !\n\nJ'ai créé une partie de Duel de Dame et j'aimerais que tu me rejoignes !\n\nCode de la partie : ${code}\nLien direct : ${gameLink}\n\nÀ bientôt sur le plateau !`)
                          window.open(`mailto:?subject=${subject}&body=${body}`)
                        }}
                        className="px-6 py-4 bg-slate-700/80 hover:bg-slate-600/80 text-slate-100 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Partager par email</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const gameLink = `${window.location.origin}/game/${code}`
                          const text = `Rejoins ma partie de Duel de Dame ! Code: ${code} - ${gameLink}`
                          if (navigator.share) {
                            navigator.share({
                              title: 'Duel de Dame',
                              text: text,
                              url: gameLink
                            }).catch(console.error)
                          } else {
                            navigator.clipboard.writeText(text).then(() => {
                              showSuccess('📋 Texte copié pour partage !')
                            })
                          }
                        }}
                        className="px-6 py-4 bg-slate-700/80 hover:bg-slate-600/80 text-slate-100 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span>Partager autrement</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Section d'aide améliorée */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/30">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">💡</div>
                      <div className="text-left">
                        <div className="text-slate-200 font-semibold mb-2">Comment inviter un adversaire ?</div>
                        <div className="text-slate-400 text-sm space-y-1">
                          <div>• Cliquez sur "Copier le lien" pour copier l'URL</div>
                          <div>• Envoyez le lien par message, email ou réseau social</div>
                          <div>• Votre adversaire cliquera sur le lien pour vous rejoindre</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicateur de statut en temps réel */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Partie active • En attente de connexion</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
} 