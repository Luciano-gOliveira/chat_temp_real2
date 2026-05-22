const app = require('express')()
const server = require('http').createServer(app)

const io = require('socket.io')(server, {
  cors: {
    origin: [
      'https://chat-temp-real2.vercel.app',
      'http://localhost:5173'
    ],
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

io.on('connection', (socket) => {

  console.log('Novo cliente: ' + socket.id)

  socket.on('set_username', (username) => {
    socket.data.username = username
  })

  socket.on('send_message', (data) => {
    io.emit('receive_message', {
      ...data,
      authorId: socket.id,
      authorUsername: socket.data.username
    })
  })

  // ✅ Videochamada DENTRO do io.on('connection')
  socket.on('join_call', () => {
    const usersInCall = [...io.sockets.sockets.values()]
      .filter(s => s.data.inCall)
      .map(s => s.id)

    socket.data.inCall = true
    socket.join('video-call')
    socket.emit('call_users', usersInCall)
    socket.to('video-call').emit('user_joined_call', socket.id)
  })

  socket.on('call_signal', ({ to, signal }) => {
    io.to(to).emit('call_signal', { from: socket.id, signal })
  })

  socket.on('leave_call', () => {
    socket.data.inCall = false
    socket.leave('video-call')
    socket.to('video-call').emit('user_left_call', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado: ' + socket.id)
  })

})

server.listen(PORT, () => {
  console.log('Rodando...')
})