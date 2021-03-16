const defaultOptions = {
  base: 'http://ri.mk:3006/cn'
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

// const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const VIEWPORT = { width: 992, height: 100, deviceScaleFactor: 1.5 }
module.exports.name = 'sc-stat'
module.exports.apply = async (app, options, storage) => {
  options = { ...defaultOptions, ...options }
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    args: ['--no-sandbox', '--disable-setuid-sandbox']

  })
  console.log('cluster started')
  cluster.task(async ({ page, data: { url, meta } }) => {
    console.log(url)
    await page.setViewport(VIEWPORT)
    await page.goto(url, {
      waitUntil: 'networkidle0'
    })
    // await wait(1000);
    // await page.goto(url);
    const screen = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: true
    })
    // Store screenshot, do something else
    const cqcode = `[CQ:image,file=base64://${screen}]`
    meta.send(cqcode).catch(err => console.warn(err))
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
    if (!username) return meta.send('提供一下用户名。 !!stat(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!stat arily, !!stat@mania arily')

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return meta.send(`模式有 osu, taiko, fruits, mania. ${mode}不在其中。`)

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
    if (!username) return meta.send('提供一下用户名。 !!pr(@模式:[osu, taiko, fruits, mania]) osuid\nex: !!pr arily, !!pr@mania arily')

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return meta.send(`模式有 osu, taiko, fruits, mania. ${mode}不在其中。`)

    await cluster.execute({
      url: `${options.base}/recent/${username}/${mode || ''}`,
      meta
    })
  })

  app.middleware(async (meta, next) => {
    if (!meta.content.startsWith('!!userpage')) { return next() }
    const command = meta.content.split(' ')
    const username = unescapeSpecialChars(command.slice(1).join(' ').trim())
    if (!username) return meta.send('提供一下用户名。 !!userpage osuid\nex: !!userpage arily')

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
    if (!username) return meta.send(reply.join('\n'))

    if (!command[0].includes('@')) mode = undefined
    mode = command[0].split('@')[1]
    if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return meta.send(`模式有 osu, taiko, fruits, mania. ${mode}不在其中。`)

    await cluster.execute({
      url: `${options.base}/best/${username}/${mode || ''}?${new URLSearchParams(params)}`,
      meta
    })
  })
}
