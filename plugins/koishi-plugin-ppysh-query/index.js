'use strict'

const CommandsInfo = require('./command/CommandsInfo')
const Command = require('./command/Command')

class PpyshQuery {
  /**
     * @param {Object} params
     * @param {Array<String>} params.admin 管理员列表，必要
     * @param {String} params.apiKey osu apiKey，必要
     * @param {String} [params.host] osu网址，默认为"osu.ppy.sh"
     * @param {String} [params.database] 数据库路径，默认为根目录下的Opsbot-v1.db
     * @param {Array<String>} [params.prefixs] 指令前缀，必须为单个字符，默认为[?,？]
     * @param {String} [params.prefix] 兼容旧版，指令前缀，必须为单个字符，默认为?
     * @param {String} [params.prefix2] 兼容旧版，备用指令前缀，必须为单个字符，默认为？
     */
  constructor (params) {
    this.globalConstant = {}
    this.globalConstant.admin = params.admin || []
    this.globalConstant.apiKey = params.apiKey || ''
    this.globalConstant.host = params.host || 'osu.ppy.sh'
    this.database = params.database || './Opsbot-v1.db'
    this.globalConstant.nedb = require('./database/nedb')(this.database)
    if (params.prefix || params.prefix2) {
      this.prefix = params.prefix || '?'
      this.prefix2 = params.prefix2 || '？'
      this.prefixs = [this.prefix, this.prefix2]
    } else {
      this.prefixs = params.prefixs || ['?', '？']
    }
    this.globalConstant.commandsInfo = new CommandsInfo(this.prefixs)
  }

  /**
     * 获得返回消息
     * @param {String} qqId
     * @param {String} message 输入的消息
     */
  async apply (qqId, message) {
    try {
      if (!message.length || message.length < 2) return ''
      if (this.prefixs.indexOf(message.substring(0, 1)) < 0) return ''
      const commandObject = new Command(qqId, message.substring(1).trim(), this.globalConstant)
      const reply = await commandObject.execute()
      return reply
    } catch (ex) {
      console.log(ex)
      return ''
    }
  }
}

module.exports.PpyshQuery = PpyshQuery
// koishi插件
module.exports.name = 'koishi-plugin-ppysh-query'
module.exports.apply = (ctx, options) => {
  const phq = new PpyshQuery(options)
  ctx.middleware(async (meta, next) => {
    try {
      const message = meta.content
      const userId = meta.userId
      const reply = await phq.apply(userId, message)
      if (reply) {
        // record格式不要艾特
        if (reply.indexOf('CQ:record') > 0) {
          await meta.send(reply)
        } else {
          await meta.send(`[CQ:at,id=${userId}]` + '\n' + reply)
        }
      } else return next()
    } catch (ex) {
      console.log(ex)
      return next()
    }
  })
}
