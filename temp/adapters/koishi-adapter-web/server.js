const server = require('http').createServer()
const io = require('socket.io')(server)
io.on('connection', client => {
  client.on('event', data => { /* … */ })
  client.on('disconnect', () => { /* … */ })
})
server.listen(process.env.CHAT_SERVER_PORT || 3004)

module.exports = {
  io,
  server
}