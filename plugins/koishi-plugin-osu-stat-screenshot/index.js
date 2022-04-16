const { Schema } = require('koishi')
const specialChars = {
  '&': '&amp;',
  '[': '&#91;',
  ']': '&#93;',
  ',': '&#44;'
}
function unescapeSpecialChars (chars) {
  chars = chars.toString()
  Object.entries(specialChars).forEach(([replace, find]) => {
    chars = chars.split(find).join(replace)
  })
  return chars
}

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
      osuRX: ['stdRX', 'stdRx', 'stdrx', 'osuRx', 'osurx', 'relax', 'osuRelax'],
      osuAP: ['stdAP', 'stdAp', 'stdap', 'osuAp', 'osuap', 'ap', 'osuAutoPilot'],
      taiko: ['太鼓', 'Taiko'],
      taikoRX: ['TaikoRx', 'Taikorx', 'taikoRx', 'taikorx'],
      fruit: ['ctb', 'CTB', '接水果', 'Ctb'],
      mania: ['骂娘', 'Mania', 'keys', 'key']
    })
})
module.exports.apply = async (app, options) => {
  options = new Schema(options)
  const cluster = app.puppeteerCluster

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!stat')) { return next() }
    let mode
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return '提供一下用户名。 !!stat(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!stat arily, !!stat@mania arily'

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return `模式有 osu, taiko, fruits, mania. ${mode}不在其中。`
    const screen = cluster.screenshot.base64(`${options.base}/users/${username}/${mode || ''}`)
    return `[CQ:image,url=base64://${screen}]`
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!pr') && !meta.content.startsWith('!!recent')) { return next() }
    let mode
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return '提供一下用户名。 !!pr(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!pr arily, !!pr@mania arily'

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return `模式有 osu, taiko, fruits, mania. ${mode}不在其中。`

    const screen = cluster.screenshot.base64(`${options.base}/recent/${username}/${mode || ''}`)
    return `[CQ:image,url=base64://${screen}]`
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!userpage')) { return next() }
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return '提供一下用户名。 !!userpage osuid\nex: !!userpage arily'

    const screen = cluster.screenshot.base64(`${options.base}/userpage/${username}`)
    return `[CQ:image,url=base64://${screen}]`
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!best')) { return next() }
    let mode
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.filter(c => !c.startsWith('@')).slice(1).join(' ').trim())
    const params = command.filter(c => c.startsWith('@')).reduce((acc, command) => {
      if (command.startsWith('@last:')) acc.startHoursBefore = command.slice(6)
      if (command.startsWith('@from:')) acc.start = command.slice(6)
      if (command.startsWith('@to:')) acc.end = command.slice(4)
      return acc
    }, {})
    if (Object.keys(params).length === 0) params.startHoursBefore = 24
    const reply = []
    reply.push('提供一下用户名。 !!best(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!best arily, !!best@mania arily')
    reply.push('指定开始日期: @from:2011-01-01')
    reply.push('指定结束日期: @to:2031-01-01')
    reply.push('或者可以指定最近几个小时: @last:24')
    if (!username) return reply.join('\n')

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return `模式有 osu, taiko, fruits, mania. ${mode}不在其中。`

    const screen = cluster.screenshot.base64(`${options.base}/best/${username}/${mode || ''}?${new URLSearchParams(params)}`)
    return `[CQ:image,url=base64://${screen}]`
  })
}

const osuScreenshot = manual
  .section('osu-info-screenshot')
  .name('ppy.sh 图片信息')

  .description('返回info.osustuff.ri.mk相关网站的截图')

osuScreenshot
  .entry('info')
  .description('osu玩家信息的图片')
  .detail('https://info.osustuff.ri.mk/users/{osuid}/{mode}')

  .usage('!!stat <osuid或用户名>')
  .usage('!!stat@osu <osuid或用户名>')
  .usage('!!stat@taiko <osuid或用户名>')
  .usage('!!stat@fruit <osuid或用户名>')
  .usage('!!stat@mania <osuid或用户名>')

osuScreenshot
  .entry('recent')
  .name('最近成绩')
  .description('返回最后上传至osu服务器的成绩')

  .usage('!!recent <osuid或用户名>')
  .usage('!!pr <osuid或用户名>')

osuScreenshot
  .entry('userpage')
  .name('生成厕所读物（误）')

  .usage('!!userpage <osuid或用户名>')

osuScreenshot
  .entry('best')
  .name('查询bp')

  .usage('!!best <osuid或用户名>')
  .usage('!!best <osuid或用户名> @last:24 最近24h的成绩')
  .usage('!!best <osuid或用户名> @from:2007-12-20 从2007-12-20到现在为止的bp')
  .usage('!!best <osuid或用户名> @from:2021-12-31 @to:2045-12-31 从2021-12-31到2045-12-31的bp')
