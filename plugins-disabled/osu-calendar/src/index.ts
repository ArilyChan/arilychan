'use strict'
import { Schema, segment } from 'koishi'
import * as run from './run'
import path from 'path'
import EventsJson from './bin/EventsJson'

import nextJSWeb from './osu-calendar-web-next/export'

const thisPath = __dirname

export const name = 'koishi-plugin-osu-calendar'
export const schema = nextJSWeb.schema = Schema.object({
  web: Schema.object({
    path: Schema.string().default('http://localhost:3005/fortune').description('screenshot path')
  }),
  auth: Schema.object({
    database: Schema.boolean().default(true).description('database auth'),
    databaseAuthority: Schema.number().default(3).description('minium authority to manage fortune.'),
    local: Schema.object({
      admin: Schema.array(String).default([]),
      blackList: Schema.array(String).default([]),
      whiteList: Schema.array(String).default([])
    })
  })
})

export function apply (ctx, options) {
  const users = options.auth.local // TODO deprecate this
  const eventPath = options.eventFile || path.join(thisPath, './osu-calendar-events.json')

  const eventsJson = new EventsJson()
  const logger = ctx.logger('osu-calendar')
  nextJSWeb.build()
  // ctx.using(['ci'], function osuCalendarCIRegister (ctx) { ctx.once('ci/build/register', () => ctx.ci.build.use(nextJSWeb.build)) })
  ctx.using(['express'], function osuCalendarWebApp (ctx) {
    ctx.once('ready', async () => {
      try {
        ctx.express.use(options.basePath || '/fortune', await nextJSWeb.webApp(options))
      } catch (_) {
        logger.warn('You need to build. run `npm run build` in osu-calendar-web')
        ctx.using(['ci'], async function osuCalendarAutoBuilder ({ ci: { build } }) {
          logger.info('You have ci plugin installed. trying auto-build...')
          await build.run({ only: [exports.name] })
          logger.info('Build finished, retry web service...')
          ctx.express.use(options.basePath || '/fortune', await nextJSWeb.webApp(options))
          logger.success('... Succeed! You are all set!')
        })
      }
    })
  })
  const command = ctx.command('fortune')

  command
    .subcommand('.today', 'today fortune')
    .alias('.daily')
    .alias('今日运势')
    .action(async (argv) => {
      const meta = argv.session
      if (!ctx.puppeteerCluster) {
        logger.error('got no cluster')
        return await run.koishiHandler(meta, eventPath)
      }
      logger.error('got cluster')
      const cluster = ctx.puppeteerCluster.instance
      cluster.queue(async ({ page }) => {
        try {
          await page.goto(`${options.web.path}/daily?seed=${meta.userId}&lang=zh-cn&displayName=${meta.author?.nickname || meta.author?.username || '你'}`)
          await page.setViewport({ width: 992, height: 100, deviceScaleFactor: 1.5 })
          const e = await page.$('#__next > div > div > div')
          const cqCode = segment.image(await e.screenshot({ type: 'jpeg' }))
          meta.send(cqCode).catch(_ => meta.send('发送图片失败。'))
        } catch (error) {
          logger.error(error)
          await run.koishiHandler(meta, eventPath)
        }
      })
    })

  const activity = command.subcommand('.activity')

  activity
    .subcommand('.add <name> <goodluck> <badluck>', 'add new activity to pool')
    .alias('添加活动')
    .example('添加活动 吃饭 吃的很饱 好难吃！')
    .action(async (argv, name, goodLuck, badLuck) => {
      const meta = argv.session
      return await eventsJson.runAdd(meta, eventPath, users, name, goodLuck, badLuck, ctx)
    })
  activity
    .subcommand('.remove <name> <goodluck> <badluck>', 'add new activity to pool')
    .alias('删除活动')
    .example('删除活动 吃饭')
    .action(async (argv, name) => {
      const meta = argv.session
      return await eventsJson.runDel(meta, eventPath, users, name)
    })
  activity
    .subcommand('.approve <name>', 'add new activity to pool')
    .alias('.confirm')
    .alias('.accept')
    .alias('确认活动')
    .example('确认活动 吃饭')
    .action(async (argv, name) => {
      const meta = argv.session
      return await eventsJson.confirmPendingEvent(meta, eventPath, users, name)
    })
  activity
    .subcommand('.reject <name>', 'remove activity from pool')
    .alias('取消活动')
    .example('取消活动 吃饭')
    .action(async (argv, name) => {
      const meta = argv.session
      return await eventsJson.refusePendingEvent(meta, eventPath, users, name)
    })
  activity
    .subcommand('.info <name>', 'show activity')
    .alias('查看活动')
    .example('查看活动 吃饭')
    .action(async (argv, name) => {
      const meta = argv.session
      return await eventsJson.showEvent(meta, eventPath, name)
    })
  activity
    .subcommand('.pending', 'show pending activity')
    .alias('待审核活动')
    .action(async (argv) => {
      const meta = argv.session
      return await eventsJson.showPendingEvent(meta, eventPath)
    })
}

// ctx.middleware(async (meta, next) => {
//   try {
//     const command = meta.content.trim().split(' ').filter(item => item !== '')
//     if (command.length < 1) return next()
//     // if (command[0] === '今日运势') {
//     //   return await run.koishiHandler(meta, eventPath, new Date())
//     // }
//     if (command[0] === '今日运势') {
//       if (!ctx.puppeteerCluster) {
//         logger.error('got no cluster')
//         return await run.koishiHandler(meta, eventPath, new Date())
//       }
//       logger.error('got cluster')
//       const cluster = ctx.puppeteerCluster.instance
//       cluster.queue(async ({ page }) => {
//         try {
//           await page.goto(`http://localhost:9000/fortune/daily?seed=${meta.userId}&lang=zh-cn&displayName=${meta.author?.nickname || meta.author?.username || '你'}`)
//           await page.setViewport({ width: 992, height: 100, deviceScaleFactor: 1.5 })
//           const e = await page.$('#__next > div > div > div')
//           const ss = await e.screenshot({ encoding: 'base64', type: 'jpeg' })
//           const cqcode = `[CQ:image,url=base64://${ss}]`
//           console.log(cqcode.length)
//           meta.send(cqcode).catch(_ => meta.send('发送图片失败。'))
//         } catch (error) {
//           logger.error(error)
//           await run.koishiHandler(meta, eventPath, new Date())
//         }
//       })
//     }
//     if (command[0].substring(0, 1) !== '!' && command[0].substring(0, 1) !== '！') return next()
//     if (command[0].length < 2) return next()
//     const act = command[0].substring(1)
//     if (act === '添加活动' || act === '增加活动') {
//       if (command.length !== 4) return '请输入正确指令：添加活动 活动名称 宜详情 忌详情'
//       return await eventsJson.runAdd(meta, eventPath, users, command[1], command[2], command[3], ctx)
//     }
//     if (act === '删除活动') {
//       if (command.length !== 2) return '请输入正确指令：删除活动 活动名称'
//       return await eventsJson.runDel(meta, eventPath, users, command[1])
//     }
//     if (act === '确认') {
//       if (command.length !== 2) return '请输入正确指令：确认 待审核活动名称'
//       return await eventsJson.confirmPendingEvent(meta, eventPath, users, command[1])
//     }
//     if (act === '取消') {
//       if (command.length !== 2) return '请输入正确指令：取消 待审核活动名称'
//       return await eventsJson.refusePendingEvent(meta, eventPath, users, command[1])
//     }
//     if (act === '待审核' || act === '查看审核') {
//       return await eventsJson.showPendingEvent(meta, eventPath)
//     }
//     if (act === '查看活动') {
//       if (command.length !== 2) return '请输入正确指令：查看活动 活动名称'
//       return await eventsJson.showEvent(meta, eventPath, command[1])
//     }
//     return next()
//   } catch (ex) {
//     logger.log(ex)
//     return next()
//   }
// })
