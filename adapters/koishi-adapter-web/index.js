// import { Server, Session, App, Context } from 'koishi-core'
// import { Logger, Time } from 'koishi-utils'
// import WsClient from './ws'
// import axios from 'axios'

// export * from './api'
// export * from './channel'
// export * from './http'
// export * from './ws'
// export * from './ws-reverse'

const { Server, Session, App, Context } = require('koishi-core')
const { Logger, Time } = require('koishi-utils')
const Client = require('ws')
const io = require('./server')
const axios = require('axios')

App.defaultConfig.quickOperation = 0.1 * Time.second

const logger = new Logger('server')

class web {
  constructor (app) {
    // const bot = app.options.bots.find(bot => bot.server)
    return new Client(app)
  }
}

Server.types['web:server'] = Client
Server.types.web = Client
Server.types.undefined = web

const { broadcast } = Context.prototype
const imageRE = /\[CQ:image,file=([^,]+),url=([^\]]+)\]/

Context.prototype.broadcast = async function (...args) {
  const index = Array.isArray(args[0]) ? 1 : 0
  let message = args[index]
  let output = ''
  let capture
  // eslint-disable-next-line no-cond-assign
  while (capture = imageRE.exec(message)) {
    const [text, , url] = capture
    output += message.slice(0, capture.index)
    message = message.slice(capture.index + text.length)
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    output += `[CQ:image,file=base64://${Buffer.from(data).toString('base64')}]`
  }
  args[index] = output + message
  return broadcast.apply(this, args)
}

Session.prototype.send = async function $send (message, autoEscape = false) {
  if (!message) return
  let ctxId

  // eslint-disable-next-line no-cond-assign
  const ctxType = (ctxId = this.groupId) ? 'group' : (ctxId = this.userId) ? 'user' : null
  if (this.$app.options.preferSync) {
    ctxType === 'group'
      ? await this.$bot.sendGroupMsg(ctxId, message, autoEscape)
      : await this.$bot.sendPrivateMsg(ctxId, message, autoEscape)
    return
  }
  if (this._response) {
    const session = this.$bot.createSession(this.messageType, ctxType, ctxId, message)
    if (this.$app.bail(this, 'before-send', session)) return
    return this._response({ reply: session.content, autoEscape, atSender: false })
  }
  return ctxType === 'group'
    ? this.$bot.sendGroupMsgAsync(ctxId, message, autoEscape)
    : this.$bot.sendPrivateMsgAsync(ctxId, message, autoEscape)
}
