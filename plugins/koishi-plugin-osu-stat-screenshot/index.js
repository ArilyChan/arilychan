const { Schema } = require('koishi')
// const specialChars = {
//   '&': '&amp;',
//   '[': '&#91;',
//   ']': '&#93;',
//   ',': '&#44;'
// }
// function unescapeSpecialChars (chars) {
//   chars = chars.toString()
//   Object.entries(specialChars).forEach(([replace, find]) => {
//     chars = chars.split(find).join(replace)
//   })
//   return chars
// }

const manual = require('sb-bot-manual')

// const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const serverConfig = Schema.object({
  default: Schema.boolean().default(false).description('默认查询此服务器'),
  server: Schema.string(),
  modes: Schema.array(String).default(['osu', 'taiko', 'fruit', 'mania'])
})

module.exports.name = 'osu-stat-screenshot'
module.exports.using = ['puppeteerCluster']
module.exports.schema = Schema.object({
  base: Schema.string().default('https://info.osustuff.ri.mk/cn').description('osu-info-web网站根目录(/{lang})'),
  server: Schema.dict(serverConfig)
    .description('配置可用的服务器')
    .default({
      bancho: {
        default: true,
        server: 'osu! 官方服务器',
        modes: ['osu', 'taiko', 'fruit', 'mania']
      },
      sb: {
        default: false,
        server: 'ppy.sb私服',
        modes: ['osu', 'osuRX', 'osuAP', 'taiko', 'taikoRX', 'fruit', 'fruitRX', 'mania']
      }
    }),
  modeAlias: Schema.dict(Schema.array(String))
    .description('mode的别名')
    .default({
      osu: ['std'],
      osuRX: ['rx', 'stdrx', 'osurx', 'relax', 'osurelax'],
      osuAP: ['ap', 'stdap', 'osuap', 'ap', 'osuautopilot'],
      taiko: ['太鼓', 'Taiko'],
      taikoRX: ['taikorx'],
      fruit: ['ctb', '接水果'],
      mania: ['骂娘', 'keys', 'key']
    })
})
// `${options.base}/users/${username}/${mode || ''}`

module.exports.apply = async (app, options) => {
  options = new Schema(options)
  const cluster = app.puppeteerCluster
  const screenshot = async (url) => {
    const screen = await cluster.screenshot.base64(url)
    return `[CQ:image,url=base64://${screen}]`
  }

  const validateMode = (op, meta) => {
    if (!op.mode) op.mode = meta.user?.osu?.[op.server]?.mode || options.server[op.server].modes[0]
    if (!options.server[op.server]) throw new Error(['Invalid server:', op.server].join(' '))
    if (!options.server[op.server].modes.includes(op.mode)) throw new Error(['Invalid mode on server:', op.server, 'with mode:', op.mode].join(' '))
    return op
  }

  const transformMode = (op) => {
    if (!op.mode) return op
    Object.entries(options.modeAlias)
      .some(([to, alias]) => {
        if (!alias.includes(op.mode.toLowerCase())) return false
        op.mode = to
        return true
      })
    return op
  }

  const ops = {
    stat ({ user: username, mode, server }) {
      return screenshot(`${options.base}/users/${username}/${mode || ''}?server=${server}`)
    },
    best ({ user: username, mode, server }) {
      return screenshot(`${options.base}/users/${username}/${mode || ''}?server=${server}`)
    },
    recent ({ user: username, mode, server }) {
      return screenshot(`${options.base}/recent/${username}/${mode || ''}?server=${server}`)
    },
    userpage ({ user: username, server }) {
      return screenshot(`${options.base}/userpage/${username}?server=${server}`)
    },
    score ({ id, server }) {
      return screenshot(`${options.base}/score/${id}?server=${server}`)
    },
    'set-user' () {
      return 'no imp yet'
    },
    'set-mode' () {
      return 'no imp yet'
    }
  }
  const run = (op, meta) => {
    op = transformMode(op, meta)
    op = validateMode(op, meta)
    if (ops[op.type]) return ops[op.type](op)
    throw new Error('unknown op')
  }
  const parser = require('./parser')
  app.middleware(async (meta, next) => {
    try {
      const data = parser.parse(meta.content)

      if (!data.length) { return next() }

      const result = await Promise.all(data.map(op => run(op, meta)))
      return result.join('\n')
    } catch (err) {
      return next()
    }
  })
}

const osuScreenshot = manual
  .section('osu-info-screenshot')
  .name('ppy.sh 图片信息')

  .description('返回info.osustuff.ri.mk相关网站的截图')
  .detail([
    '现在支持bancho和sb服, 通过前缀指定服务器。',
    '!! / ? 是bancho服务器; *是sb服。',
    '下面的例子全部以sb服举例。'
  ].join('\n'))

osuScreenshot
  .entry('info')
  .description('osu玩家信息的图片')
  .detail([
    '需要指定mode可以在stat关键字后面加mode。',
    '可用的mode:',
    '[osu, osuRX, osuAP, taikoRX, fruit, fruitRX, mania]'
  ].join('\n'))

  .usage('*stat <osuid或用户名>')
  .usage('*stat#osuRX <osuid或用户名>')

osuScreenshot
  .entry('recent')
  .name('最近成绩')
  .description('返回最后上传至osu服务器的成绩')

  .usage('*recent <osuid或用户名>')
  .usage('*pr <osuid或用户名>')

osuScreenshot
  .entry('userpage')
  .name('生成厕所读物（误）')

  .usage('*userpage <osuid或用户名>')

osuScreenshot
  .entry('best')
  .name('查询bp')

  .usage('*best <osuid或用户名>')
  .usage('*bp <osuid或用户名>')
  .usage('*bp1 <osuid或用户名> // bp1')
  .usage('*best <osuid或用户名> @last 24 // 最近24h的成绩')
  .usage('*best <osuid或用户名> @from 2007-12-20 // 从2007-12-20到现在为止的bp')
  .usage('*best <osuid或用户名> @from 2021-12-31 @to 2045-12-31 // 从2021-12-31到2045-12-31的bp')
