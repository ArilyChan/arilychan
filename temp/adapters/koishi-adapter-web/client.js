import { App, Server } from 'koishi-core'
import { Logger, Time } from 'koishi-utils'

App.defaultConfig.retryInterval = 5 * Time.second

const logger = new Logger('server')

export default class WsClient extends Server {
  constructor (...args) {
    super(...args)
    this.io = require('../server.js').io
  }

  async __listen (bot) {
    const chat = this.io.of('/chat')
    chat.on('connection', socket => {
      socket.on('join-room', ({ room }) => {
        socket.join(room)
      })
      socket.on('client-message', ({ room, message }) => {
        if (!room || !message) return
        const meta = this.server.prepare({
          groupId: room.toString(),
          selfId: -1,
          userId: socket.id
        })
        this.server.dispatch(meta)
      })
    })
    bot.ready = true
  }

  async _listen () {
    await Promise.all(this.bots.map(bot => this.__listen(bot)))
  }

  _close () {
    logger.debug('websocket client closing')
    for (const socket of this._sockets) {
      socket.close()
    }
    this._retryCount = 0
  }
}
