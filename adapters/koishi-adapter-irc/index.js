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
        if (!seg.data.url) return '[Image(not available)]'
        return `[${seg.data.url} Image]`
      }
      case 'audio': {
        if (!seg.data.url) return '[Audio(not available)]'
        return `[${seg.data.url} Audio]`
      }
      case 'video': {
        if (!seg.data.url) return '[Video(not available)]'
        return `[${seg.data.url} Video]`
      }
      case 'file': {
        if (!seg.data.url) return '[File(not available)]'
        return `[${seg.data.url} File]`
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
    const message = parsed.map(this.transformSegment)
    bot.app.logger('adapter-irc:bot').debug('sending message', { channelId, content })
    return this.client.say(channelId, message.join(''))
  }

  async sendGroupMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) throw new Error('trying to send group msg to non-group channel')
    return this.sendMessage(channelId, ...args)
  }

  async sendPrivateMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) throw new Error('trying to send private msg to non-private channel')
    return this.sendMessage(channelId, ...args)
  }

  async getChannel (channelId) {
    return this.getChannelList().find(channel => channel.name === channelId)
  }

  async getChannelList () {
    if (this.list) return this.list
    this.client.list()
    const list = await pEvent(this.client, 'channellist')
    this.list = list.map(channel => ({
      channelId: channel.name,
      channelName: channel.name,
      topic: channel.topic
    }))
    return list
  }
}

class IRCAdapter extends Adapter {
  constructor (app) {
    // MyBot 跟上面一样，我就不写了
    super(app, IRCBot)
  }

  start () {
    this.bots.map(async bot => {
      if (bot.client) {
        try {
            // bot.client.disconnect()
            bot.client.removeAllListeners()
            // bot.client = undefined
        } catch (error) {
          
        }

      }
      bot.client = new irc.Client(bot.host, bot.nickname, {
        ...bot,
        userName: bot.username || bot.userName
      })
      bot.selfId = bot.nickname
      bot.client.connect()
      bot.client.addListener('error', function (message) {
        bot.app.logger('adapter-irc:bot').error('error: ', message)
      })
      await pEvent(bot.client, 'registered')

      const channels = await bot.getChannelList()
      channels.map(channel => bot.client.join(channel.channelId))
      console.table(channels)

      bot.client.on('message', (nick, to, text, message) => {
        bot.app.logger('adapter-irc:bot').debug('received message', { nick, to, text })
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
        Object.defineProperty(data, 'messageId', {
          get () {
            return {
              toString () {
                return `${to}:${nick}`
              },
              channelId: to,
              nickname: nick
            }
          },
          enumerable: true
        })
        Object.defineProperty(data, 'message', {
          get () {
            bot.app.logger('adapter-irc:bot').warn(Error('please use session.content in v3.\n Stack Trace:\n').stack)
            return data.content
          },
          set (newValue) { data.content = newValue },
          enumerable: true,
          configurable: true
        })
        Object.defineProperty(data, '$parsed', {
          get () {
            bot.app.logger('adapter-irc:bot').warn(Error('Session.$parsed is removed in v3.').stack)
            return {
              message: data.content.trim()
            }
          },
          enumerable: true,
          configurable: true
        })
        const session = new Session(bot.app, data)
        session.$send = (...args) => {
          bot.app.logger('adapter-irc').warn(Error('please use session.send() in v3.\n Stack Trace:').stack)
          return session.send(...args)
        }
        this.dispatch(session)
      })
      bot.status = 0
    })
  }
}

// 注册适配器
Adapter.types.irc = IRCAdapter
