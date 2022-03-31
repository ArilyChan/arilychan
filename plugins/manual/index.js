const helps = require('sb-bot-manual')
const { Context, Schema } = require('koishi')
// const { build, web } = require('./export')
const chat = require('./chat/chat')
const schema = Schema.object({
  dev: Schema.boolean().default(false),
  web: Schema.object({
    prefix: Schema.string().default('/manual').description('prefix for help doc')
  }),
  chat: Schema.object({
    trigger: Schema.array(String).default(['arilychan help', 'help', 'arilychan manual']).description('keywords'),
    prefix: Schema.array(String).default(['!', '！', '/']).description('prefix')
  })
})

Context.service('manual')
module.exports = {
  name: 'arilychan-manual',
  schema,
  apply (ctx, options) {
    // const logger = ctx.logger('arilychan-manual')
    // inject service
    ctx.manual = helps
    options = new Schema(options)
    // install web page on express server
    // ctx.using(['express'], async function ManualOnWeb ({ express }) {
    //   let handler
    //   try {
    //     handler = await web(options)
    //   } catch (error) {
    //     if (error.message === 'you need to build.') {
    //       await build(options)
    //       logger.info('all set~!')
    //       handler = await web(options)
    //     }
    //   } finally {
    //     if (handler) express.use(options.web.prefix, handler)
    //   }
    // })

    // chat access
    ctx.middleware((session, next) => {
      if (!options.chat.prefix.some(prefix => session.content.startsWith(prefix))) { return next() }
      if (!options.chat.trigger.some(trigger => session.content.includes(trigger))) { return next() }
      chat(session)
    })
  }
}
