'use strict'
// @ts-check
const AskObject = require('./objects/AskObject')
const QuestionTypeHelper = require('./QuestionType/QuestionTypeHelper')
const SendMessageObject = require('./objects/SendMessageObject')
const SentMessageCollection = require('./objects/SentMessageCollection')
const { h } = require('koishi')

class SillyChooser {
  /**
     * @param {Object} params
     * @param {Array<String>} [params.prefixes] 指令前缀，必须为单个字符，默认为["!","！"]
     */
  constructor (params) {
    this.prefixes = params.prefixes || ['!', '！']
    this.smc = new SentMessageCollection()
  }

  /**
     * 获得返回消息
     * @param {Number} botId
     * @param {Number} qqId
     * @param {String} message 输入的消息
     */
  apply (botId, qqId, message) {
    try {
      if (!message.length || message.length < 2) return ''
      const atBot = h('at', { id: botId })
      if (message.substring(0, atBot.length) === atBot) message = message.substring(atBot.length).trim()
      else if (this.prefixes.indexOf(message.substring(0, 1)) >= 0) message = message.substring(1).trim()
      else return ''
      if (!message) return ''

      const askObject = new AskObject(message)
      const method = QuestionTypeHelper.getMethod(askObject.removeSpecialStrings())
      if (!method) return ''
      const replyObject = method(askObject)
      if (!replyObject.reply) return ''
      // 测试用
      // console.log(replyObject.choices);
      const replyString = replyObject.toString()
      if (!replyString) return ''
      let smo = new SendMessageObject(this.smc.maxHandle, qqId, message, replyString)
      smo = this.smc.putIn(smo)
      return smo.send()
    } catch (ex) {
      console.log(ex)
      return ''
    }
  }
}

module.exports.SillyChooser = SillyChooser
// koishi插件
module.exports.name = 'koishi-plugin-SillyChooser'
module.exports.apply = (ctx, options) => {
  const sc = new SillyChooser(options)
  ctx.middleware(async (meta, next) => {
    try {
      const message = meta.content
      const userId = meta.userId
      const reply = sc.apply(meta.selfId, userId, message)
      if (!reply) return next()
      const replyMessage = []
      if (meta.contentType !== 'private') {
        replyMessage.push(h('quote', { id: meta.messageId }))
      }
      replyMessage.push(reply)
      return replyMessage.join('')
    } catch (ex) {
      console.log(ex)
      return next()
    }
  })
}
