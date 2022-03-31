const defaultOptions = {
  base: 'https://info.osustuff.ri.mk/cn'
}
const specialChars = {
  '&': '&amp;',
  '[': '&#91;',
  ']': '&#93;',
  ',': '&#44;'
}
function unescapeSpecialChars (chars) {
  chars = chars.toString()
  Object.entries(specialChars).map(([replace, find]) => {
    chars = chars.split(find).join(replace)
  })
  return chars
}

const { Cluster } = require('puppeteer-cluster')
const manual = require('sb-bot-manual')

// const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const VIEWPORT = { width: 992, height: 100, deviceScaleFactor: 1.5 }
module.exports.name = 'sc-stat'
module.exports.apply = async (app, options, storage) => {
  const logger = app.logger('puppeteer-cluster')
  options = { ...defaultOptions, ...options }
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    }
  })
  logger.info('cluster started')
  cluster.task(async ({ page, data: { url, meta } }) => {
    logger.info(url)
    await page.setViewport(VIEWPORT)
    await page.goto(url, {
      waitUntil: 'networkidle0'
    })
    // await wait(1000);
    // await page.goto(url);
    const screen = await page.screenshot({
      type: 'jpeg',
      encoding: 'base64',
      fullPage: true
    })
    // Store screenshot, do something else
    const cqcode = `[CQ:image,url=base64://${screen}]`
    meta.send(cqcode).catch(_ => meta.send('发送图片失败。'))
  })
  cluster.on('taskerror', (err, data, willRetry) => {
    if (willRetry) {
      console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`)
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`)
    }
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!stat')) { return next() }
    let mode
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return '提供一下用户名。 !!stat(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!stat arily, !!stat@mania arily'

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return `模式有 osu, taiko, fruits, mania. ${mode}不在其中。`

    await cluster.execute({
      url: `${options.base}/users/${username}/${mode || ''}`,
      meta
    })
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

    await cluster.execute({
      url: `${options.base}/recent/${username}/${mode || ''}`,
      meta
    })
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!userpage')) { return next() }
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return '提供一下用户名。 !!userpage osuid\nex: !!userpage arily'

    await cluster.execute({
      url: `${options.base}/userpage/${username}`,
      meta
    })
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

    await cluster.execute({
      url: `${options.base}/best/${username}/${mode || ''}?${new URLSearchParams(params)}`,
      meta
    })
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
