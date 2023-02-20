import { IncomingMessage } from '../types'
import * as Receiver from '../cutting-edge-mail-client/receiver'
import * as Sender from '../cutting-edge-mail-client/sender'
import { Bot, Logger, Session, SendOptions, Universal } from 'koishi'
import { Bridge } from '../bridge-between-mail-and-message'
import MailClient from '../cutting-edge-mail-client'
import { Fragment } from '@satorijs/element'
import { Options } from '../'
import { LocalMailAddress } from '../cutting-edge-mail-client/address'

export type Config = Bot.Config & Options
export class MailBot extends Bot {
  logger: Logger = new Logger('adapter-mail')

  client: MailClient = new MailClient()
  bridge: Bridge = new Bridge()

  sender: Sender.BaseSender
  receiver: Receiver.BaseReceiver

  _subscriber: this['incomingMessage']

  constructor (ctx, config: Config) {
    let sender: Sender.BaseSender, receiver: Receiver.BaseReceiver
    if (!config) throw new Error('I lost my config')
    switch (config.sender) {
      case 'node-mailer-smtp': {
        sender = new Sender.NodeMailer(config.senderConfig, new LocalMailAddress({ address: config.address || config.senderConfig.auth.user }))
        break
      }
      case 'test': {
        sender = new Sender.TestSender(config)
        break
      }
      default: {
        throw new Error('unknown adapter')
      }
    }
    switch (config.receiver) {
      case 'imap': {
        receiver = new Receiver.IMAPReceiver(config.receiverConfig)
        break
      }
      case 'test': {
        receiver = new Receiver.TestReceiver(config.receiverConfig)
        break
      }
      default: {
        throw new Error('unknown receiver')
      }
    }
    console.log(sender)
    const selfId = sender.mail.address
    super(ctx, {
      platform: 'mail',
      selfId
    })
    this.receiver = receiver
    this.sender = sender

    this.status = 'connect'
    this.client.useReceiver(receiver)
    this.client.useSender(sender)
    this.bridge.useClient(this.client)
    this.subscribe()
  }

  async sendMessage (channelId: string, content: string) {
    // 这里应该执行发送操作
    this.logger.info('send:', content)
    // Bridge.send(, content)
    return []
  }

  async subscribe () {
    this._subscriber = this.incomingMessage.bind(this)
    this.bridge.subscribe(this._subscriber)
    this.bridge.bridge()

    this.status = 'online'
    const unread = await this.receiver.fetch()
    unread.map(mail => this.receiver.incomingChain(mail))
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
        id: this.sender.mail.address,
        name: this.sender.mail.name
      },
      content: content.toString()
    })
    return []
  }

  async stop () {
    this.bridge.unsubscribe(this._subscriber)
  }

  getSelf () {
    return Promise.resolve({
      userId: this.sender.mail.address,
      username: this.sender.mail.name
    })
  }

  getFriendList (): Promise<Universal.User[]> {
    return Promise.resolve([])
  }

  getGuild (guildId: string): Promise<Universal.Guild> {
    return Promise.resolve(null)
  }

  getGuildList (): Promise<Universal.Guild[]> {
    return Promise.resolve([])
  }

  getGuildMember () {
    return Promise.resolve(null)
  }

  getGuildMemberList () {
    return Promise.resolve([])
  }

  getChannel () {
    return Promise.resolve(null)
  }

  getChannelList () {
    return Promise.resolve([])
  }

  handleFriendRequest () {
    return Promise.resolve()
  }

  handleGuildRequest () {
    return Promise.resolve()
  }

  handleGuildMemberRequest () {
    return Promise.resolve()
  }
}

// export default class MailAdapter extends Adapter<MailBot> {
//   app: App

//   bots: Bot[]

//   constructor (app: App, bot: MailBot) {
//     // 请注意这里的第二个参数是应该是一个构造函数而非实例
//     super()
//     bot.adapter = this
//   }

//   async connect (bot: MailBot) {
//     if (!config) throw new Error('I lost my config')
//     switch (config.sender[0]) {
//       case 'nodemailer': {
//         const [, ...conf] = config.sender
//         sender = new Sender.NodeMailer(...conf)
//         break
//       }
//       case 'test': {
//         const [, ...conf] = config.sender
//         sender = new Sender.TestSender(...conf)
//         break
//       }
//       default: {
//         throw new Error('unknown adapter')
//       }
//     }
//     switch (config.receiver[0]) {
//       case 'imap': {
//         const [, ...conf] = config.receiver
//         receiver = new Receiver.IMAPReceiver(...conf)
//         break
//       }
//       case 'test': {
//         const [, ...conf] = config.receiver
//         receiver = new Receiver.TestReceiver(...conf)
//         break
//       }
//       default: {
//         throw new Error('unknown receiver')
//       }
//     }
//    this.client.useReceiver(receiver)
//    this.client.useSender(sender)
//     bot.bridge.useClient(bot.client)
//     bot.subscribe()
//   }

//   async stop () {
//     this.bots.map(bot => bot.stop())
//   }
// }
