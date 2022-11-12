const { Schema } = require('koishi')
const parser = require('./screenshot-syntax')

module.exports.name = 'osu-stat-screenshot'
module.exports.using = ['puppeteerCluster']
module.exports.schema = Schema.object({
  prefix: Schema.array(String).default(['!!', '*', '?', '/*', '//']).description('skip if not starts with'),
  includeComment: Schema.boolean().default(false).description('include comments in response')
})

module.exports.apply = async (app, options) => {
  const ops = {
    stat: {
      command: 'osu.info',
      screenshot: 'osu.info.screenshot',
      text: 'osu.info.text'
    },
    'recent-score': {
      command: 'osu.recent',
      screenshot: 'osu.recent.screenshot',
      text: 'osu.recent.text'
    },
    userpage: {
      command: 'osu.userpage',
      screenshot: 'osu.userpage.screenshot',
      text: 'osu.userpage.text'
    },
    'best-score': {
      command: 'osu.best',
      screenshot: 'osu.best.screenshot',
      text: 'osu.best.text'
    },
    score: {
      command: 'osu.score',
      screenshot: 'osu.score.screenshot',
      text: 'osu.score.text'
    },
    'set-user': {
      command: 'osu.bind',
      text: 'osu.bind'
    },
    'set-mode': {
      command: 'osu.bind',
      text: 'osu.bind'
    }
  }
  const run = async (parsedCommand, session) => {
    if (parsedCommand.comment) {
      // is comment
      if (options.includeComment) {
        return parsedCommand.comment[1]
      }
      return
    } else if (!parsedCommand.type) return
    else if (!ops[parsedCommand.type]) return
    // handle command
    const commandConf = ops[parsedCommand.type]
    let command
    if (/* choose pic or string here */true && commandConf.screenshot) command = app.command(commandConf.screenshot)
    else command = app.command(commandConf.text || commandConf.command)
    // end
    const user = parsedCommand.user
    delete parsedCommand.type
    delete parsedCommand.user
    return session.execute({ session, options: parsedCommand, args: [user], command }, true)
  }

  app.middleware(async (meta, next) => {
    try {
      const triggered = options.prefix.some((trigger) => meta.content.startsWith(trigger))
      if (!triggered) return next()
      const data = parser.parse(meta.content)
      if (!data.length) { return next() }
      if (!data.some(line => line.type)) return next()
      const result = await Promise.all(data.map(op => run(op, meta)))
      return result.filter(a => a).join('\n')
    } catch (err) {
      // return err.message
      // logger.error(err)
      return next()
    }
  })
}
