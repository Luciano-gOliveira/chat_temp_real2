const app = require('express')()
const server = require('http').createServer(app)

const io = require('socket.io')(server,{
    cors:{
        origin:'http://localhost:5173'
    }
})

const PORT = 3001

io.on('connection',(socket)=>{

    console.log('Novo cliente: '+socket.id)

    socket.on('set_username', username=>{
        socket.data.username = username
    })

    socket.on('send_message', message=>{

        io.emit('receive_message',{
            text: message,
            authorId: socket.id,
            authorUsername: socket.data.username
        })

    })

    socket.on('disconnect',()=>{
        console.log('Cliente desconectado: '+socket.id)
    })
})

server.listen(PORT,()=>{
    console.log('Rodando...')
})