const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'tsx')
app.use(express.static('public'))
app.engine('tsx', require('express-react-views').createEngine());

app.get('/call', (req: any, res: any) => {
  res.redirect(`/call/${uuidV4()}`)
})

app.get('/call/:room', (req: any, res: any) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId: any, userId: any) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || 3000)
