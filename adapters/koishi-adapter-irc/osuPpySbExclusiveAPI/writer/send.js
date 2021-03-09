module.exports = (stream, bot) => {
  return bot.socket.send(stream)
}
