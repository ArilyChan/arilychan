const { Adapter, Bot } = require('koishi-core')
const irc = require('irc')
// const WebSocket = require('ws')
// const osuPpySbExclusive = require('./osuPpySbExclusiveAPI')

class IRCBot extends Bot {
  // async sendMessage (channelId, content) {
  //   const parsed = osuPpySbExclusive.writer.toStream({ channelId, content })
  //   const result = osuPpySbExclusive.writer.send(parsed, this)
  //   this.logger.debug('send:', content)
  //   const msgId = await result
  //   return msgId
  // }

  async sendGroupMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) throw new Error('trying to send group msg to non-group channel')
    return this.sendMessage(channelId, ...args)
  }

  async sendPrivateMessage (channelId, ...args) {
    if (!channelId.startsWith('#')) throw new Error('trying to send private msg to non-private channel')
    return this.sendMessage(...args)
  }

  async getChannelList () {
    return ['#bot', 'arily', '#lobby', '#osu'] // for test
  }
}

class OsuPpySb extends Adapter {
  constructor (app) {
    // MyBot 跟上面一样，我就不写了
    super(app, IRCBot)
  }

  // prepare 方法要求你返回一个 WebSocket 实例
  // prepare (bot) {
  //   bot.status = 6
  //   return new WebSocket(this.option.address || 'irc://localhost')
  // }

  // connect 方法将作为 socket.on('open') 的回调函数
  connect (bot) {
    this.client = new irc.Client(bot.options.host, bot.options.nickname, {
      ...bot.options,
      userName: bot.options.username
    })
    bot.status = 0
    // bot.socket.on('message', async (data) => {
    //   const parsed = osuPpySbExclusive.reader.parse(data)
    //   const sessosuPpySbExclusiven = osuPpySbExclusive.reader.toSessosuPpySbExclusiven(parsed, bot)
    //   process.nextTick(() => this.dispatch(sessosuPpySbExclusiven))
    // })
    const list = this.client.list()
    console.log(this.logger)
  }
}

// 注册适配器
Adapter.types.irc = OsuPpySb
