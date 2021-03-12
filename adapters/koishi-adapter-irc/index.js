const { Adapter, Bot, Session, segment: s } = require('koishi-core')

const irc = require('irc')
const pEvent = require('p-event')

class IRCBot extends Bot {
  transformSegment (seg) {
    switch (seg.type) {
      case 'text': {
        return seg.data.content
      }
      case 'at':
      case 'sharp': {
        const target = seg.data.name || seg.data.id || seg.data.qq
        return `@${target}`
      }
      case 'reply': {
        const [, target] = seg.data.id.split(':')
        return `@${target} ` // usually there's no trailing space after reply. Add it for readibility
      }
      case 'image': {
        const file = seg.data.url || seg.data.file
        if (!file) return '[Image(not available)]'
        return `[${file} Image]`
      }
      case 'record':
      case 'audio': {
        const file = seg.data.url || seg.data.file
        if (!file) return '[Audio(not available)]'
        return `[${file} Audio]`
      }
      case 'video': {
        const file = seg.data.url || seg.data.file
        if (!file) return '[Video(not available)]'
        return `[${file} Video]`
      }
      case 'file': {
        const file = seg.data.url || seg.data.file
        if (!file) return '[File(not available)]'
        return `[${file} File]`
      }
      case 'face': {
        return `[动画表情(${seg.data.name}.jpg)]`
      }

      default:
        console.log(seg)
        return ''
    }
  }

  async sendMessage (channelId, content, isPrivate = false) {
    // this.app.logger('adapter-irc:bot').info(s.parse(content))
    const parsed = s.parse(content)
    const message = parsed.map(this.transformSegment.bind(this))
    this.app
      .logger('adapter-irc:bot')
      .debug('sending message', { channelId, content })
    return this.client.say(channelId, message.join(''))
  }

  async sendGroupMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) { throw new Error('trying to send group msg to non-group channel') }
    return this.sendMessage(channelId, ...args)
  }

  async sendPrivateMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) { throw new Error('trying to send private msg to non-private channel') }
    return this.sendMessage(channelId, ...args)
  }

  async getChannel (channelId) {
    return this.getChannelList().find((channel) => channel.name === channelId)
  }

  async getChannelList () {
    if (this.list) return this.list
    this.client.list()
    const list = await pEvent(this.client, 'channellist', { timeout: this.timeout || 10 * 1000 })
    this.list = list.map((channel) => ({
      channelId: channel.name,
      channelName: channel.name,
      topic: channel.topic
    }))
    return list
  }

  // supportV2PluginSession (session) {
  //   Object.defineProperty(session, 'messageId', {
  //     get () {
  //       return {
  //         toString () {
  //           return `${session.channelId}:${session.userId}`
  //         },
  //         channelId: session.channelId,
  //         nickname: session.userId
  //       }
  //     },
  //     enumerable: true
  //   })
  //   Object.defineProperty(session, 'sender', {
  //     get () {
  //       this.app
  //         .logger('adapter-irc:bot')
  //         .warn(Error('Session.sender is removed in v3.').stack)
  //       return {
  //         userId: session.userId,
  //         channelId: session.channelId,
  //         nickname: session.userId
  //       }
  //     },
  //     enumerable: true
  //   })
  //   Object.defineProperty(session, 'message', {
  //     get () {
  //       this.app
  //         .logger('adapter-irc:bot')
  //         .warn(Error('please use session.content in v3.\nStack Trace:').stack)
  //       return session.content
  //     },
  //     set (newValue) {
  //       session.content = newValue
  //     },
  //     enumerable: true,
  //     configurable: true
  //   })
  //   Object.defineProperty(session, '$parsed', {
  //     get () {
  //       this.app
  //         .logger('adapter-irc:bot')
  //         .warn(Error('Session.$parsed is removed in v3.').stack)
  //       return {
  //         message: session.content.trim()
  //       }
  //     },
  //     enumerable: true,
  //     configurable: true
  //   })
  //   session.$send = (...args) => {
  //     this.app
  //       .logger('adapter-irc:bot')
  //       .warn(Error('please use session.send() in v3.\nStack Trace:').stack)
  //     return session.send(...args)
  //   }
  // }
}

class IRCAdapter extends Adapter {
  constructor (app) {
    // MyBot 跟上面一样，我就不写了
    super(app, IRCBot)
  }

  start () {
    this.bots.map(async (bot) => {
      if (bot.client) {
        try {
          // bot.client.disconnect()
          bot.client.removeAllListeners()
          // bot.client = undefined
        } catch (error) {}
      }
      const logger = bot.app.logger('adapter-irc:bot')
      bot.client = new irc.Client(bot.host, bot.nickname, {
        ...bot,
        userName: bot.username || bot.userName
      })
      bot.selfId = bot.nickname
      bot.client.connect()
      bot.client.addListener('error', function (message) {
        logger.error('error: ', message)
      })
      await pEvent(bot.client, 'registered', { timeout: this.timeout || 10 * 1000 }).catch(error => {
        // logger.error('error on logging in', error)
        throw error
      })
      logger.debug('logged in')

      const channels = await bot.getChannelList()
      console.table(channels)
      channels.map((channel) => bot.client.join(channel.channelId, () => logger.debug('joined', channel.channelId)))
      logger.debug('joined all channels')
      bot.client.on('message', (nick, to, text, message) => {
        logger.debug('received message', { nick, to, text })
        const data = {
          type: 'message',
          platform: bot.platform,
          selfId: bot.selfId,
          messageType: to.startsWith('#') ? 'group' : 'private',
          groupId: to,
          channelId: to,
          content: text,
          userId: nick
        }
        const session = new Session(bot.app, data)
        Object.defineProperty(session, 'messageId', {
          get () {
            return {
              toString () {
                return `${session.channelId}:${session.userId}`
              },
              channelId: session.channelId,
              nickname: session.userId
            }
          },
          enumerable: true
        })
        // bot.supportV2PluginSession(session)
        this.dispatch(session)
      })
      bot.status = 0
    })
  }
}

// 注册适配器
Adapter.types.irc = IRCAdapter
