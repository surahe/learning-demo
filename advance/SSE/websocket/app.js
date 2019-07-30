var io = require('socket.io').listen(server)

io.on('connection', function (socket) {
  socket.emit('open')

  io.on('message', function (msg) {
    console.log('服务器接收到客户端消息', msg)

    socket.emit('test', 123)
    socket.broadcast.emit('test', 456)
  })
  
  io.on('disconnect', function () {})
})