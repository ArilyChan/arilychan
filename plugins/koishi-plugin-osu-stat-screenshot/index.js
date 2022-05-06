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
    },
    comment: {
      echo: true
    }
  }
  const run = async (parsedCommand, session) => {
    if (Array.isArray(parsedCommand)) {
      // is comment
      if (ops.command.echo) {
        return parsedCommand[1]
      }
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
    return session.execute({ session, options: parsedCommand, args: [user], command })
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

// const osuScreenshot = manual
//   .section('osu-info-screenshot')
//   .name('ppy.sh 图片信息')

//   .description('返回info.osustuff.ri.mk相关网站的截图')
//   .detail([
//     '现在支持bancho和sb服, 通过前缀指定服务器。',
//     '!! / ? 是bancho服务器; *是sb服。',
//     '下面的例子全部以sb服举例。'
//   ].join('\n'))

// osuScreenshot
//   .entry('info')
//   .description('osu玩家信息的图片')
//   .detail([
//     '需要指定mode可以在stat关键字后面加mode。',
//     '可用的mode:',
//     '[osu, osuRX, osuAP, taikoRX, fruit, fruitRX, mania]'
//   ].join('\n'))

//   .usage('*stat <osuid或用户名>')
//   .usage('*stat#osuRX <osuid或用户名>')

// osuScreenshot
//   .entry('recent')
//   .name('最近成绩')
//   .description('返回最后上传至osu服务器的成绩')

//   .usage('*recent <osuid或用户名>')
//   .usage('*pr <osuid或用户名>')

// osuScreenshot
//   .entry('userpage')
//   .name('生成厕所读物（误）')

//   .usage('*userpage <osuid或用户名>')

// osuScreenshot
//   .entry('best')
//   .name('查询bp')

//   .usage('*best <osuid或用户名>')
//   .usage('*bp <osuid或用户名>')
//   .usage('*bp1 <osuid或用户名> // bp1')
//   .usage('*best <osuid或用户名> @last 24 // 最近24h的成绩')
//   .usage('*best <osuid或用户名> @from 2007-12-20 // 从2007-12-20到现在为止的bp')
//   .usage('*best <osuid或用户名> @from 2021-12-31 @to 2045-12-31 // 从2021-12-31到2045-12-31的bp')
