import { IncomingMessage } from './../types/index'
import * as Receiver from './../cutting-edge-mail-client/receiver'
import * as Sender from './../cutting-edge-mail-client/sender'
import { App, Adapter, Bot, Logger, Session, SendOptions } from 'koishi'
import { Bridge } from '../bridge-between-mail-and-message'
import MailClient from '../cutting-edge-mail-client'
import { Fragment } from '@satorijs/element'

export interface Config extends Bot.Config {
  sender:
    | ['nodemailer', ...ConstructorParameters<typeof Sender.NodeMailer>]
    | ['test']
  receiver:
    | ['imap', ...ConstructorParameters<typeof Receiver.IMAPReceiver>]
    | ['test']
}
class MyBot extends Bot<Config> {
  logger: Logger = new Logger('adapter-mail')

  client: MailClient = new MailClient()
  bridge: Bridge = new Bridge()

  sender: Sender.BaseSender
  receiver: Receiver.BaseReceiver

  _subscriber: this['incomingMessage']

  async sendMessage (channelId: string, content: string) {
    // 这里应该执行发送操作
    this.logger.debug('send:', content)
    // Bridge.send(, content)
    return []
  }

  subscribe () {
    this._subscriber = this.incomingMessage.bind(this)
    this.bridge.subscribe(this._subscriber)
    this.bridge.bridge()
  }

  incomingMessage (message: IncomingMessage) {
    const { from: { id: userId, name: nickname }, content, id } = message
    const session = new Session(this, { author: { userId, nickname }, content })
    session.id = id
    this.dispatch(session)
  }

  async sendPrivateMessage (userId: string, content: Fragment, options?: SendOptions) {
    await this.bridge.sendMessage({
      to: {
        id: userId
      },
      from: {
        id: this.receiver.address.address,
        name: this.receiver.address.name
      },
      content: content.toString()
    })
    return []
  }

  async stop () {
    this.bridge.unsubscribe(this._subscriber)
  }
}

export default class MailAdapter extends Adapter<MyBot> {
  app: App

  bots: Bot[]

  constructor (app: App, bot: MyBot) {
    // 请注意这里的第二个参数是应该是一个构造函数而非实例
    super()
    bot.adapter = this
  }

  async connect (bot: MyBot) {
    if (!bot.config) throw new Error('I lost my config')
    switch (bot.config.sender[0]) {
      case 'nodemailer': {
        const [, ...conf] = bot.config.sender
        bot.sender = new Sender.NodeMailer(...conf)
        break
      }
      case 'test': {
        bot.sender = new Sender.TestSender()
        break
      }
      default: {
        throw new Error('unknown adapter')
      }
    }
    switch (bot.config.receiver[0]) {
      case 'imap': {
        bot.receiver = new Receiver.IMAPReceiver(bot.config.receiver[1])
        break
      }
      case 'test': {
        bot.receiver = new Receiver.TestReceiver()
        break
      }
      default: {
        throw new Error('unknown receiver')
      }
    }
    bot.client.useReceiver(bot.receiver)
    bot.client.useSender(bot.sender)
    bot.bridge.useClient(bot.client)
    bot.subscribe()
  }

  async stop () {
    this.bots.map(bot => bot.stop())
  }
}
