const { Server } = require('socket.io')
const http = require('http')

const server = http.createServer()
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

const games = {} // { code: { players: [{id, color}], state: ... } }

io.on('connection', (socket) => {
  socket.on('join', (code) => {
    if (!games[code]) games[code] = { players: [], state: null }
    if (games[code].players.length >= 2) {
      socket.emit('full')
      return
    }
    const color = games[code].players.length === 0 ? 'white' : 'black'
    games[code].players.push({ id: socket.id, color })
    socket.join(code)
    socket.emit('joined', { code, color })
    io.to(code).emit('players', games[code].players.length)
  })

  socket.on('move', ({ code, move }) => {
    // move = { from, to }
    socket.to(code).emit('move', move)
  })

  socket.on('disconnect', () => {
    for (const code in games) {
      games[code].players = games[code].players.filter(p => p.id !== socket.id)
      if (games[code].players.length === 0) delete games[code]
      else io.to(code).emit('players', games[code].players.length)
    }
  })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log('Socket.IO server running on port', PORT)
}) 