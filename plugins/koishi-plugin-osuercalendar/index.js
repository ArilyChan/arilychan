'use strict'

const run = require('./run')
const path = require('path')
const EventsJson = require('./eventsJson')
const thisPath = __dirname

// Koishi插件名
module.exports.name = 'koishi-plugin-osuercalendar'
// 插件处理和输出
module.exports.apply = (ctx, options) => {
  const users = options.users || { admin: [], blackList: [], whiteList: [] }
  const eventPath = options.eventFile || path.join(thisPath, './osuercalendar-events.json')

  const eventsJson = new EventsJson()

  ctx.middleware(async (meta, next) => {
    try {
      const command = meta.message.trim().split(' ').filter(item => item !== '')
      if (command.length < 1) return next()
      if (command[0] === '今日运势') {
        return await run.koishiHandler(meta, eventPath, new Date())
      }
      if (command[0].substring(0, 1) !== '!' && command[0].substring(0, 1) !== '！') return next()
      if (command[0].length < 2) return next()
      const act = command[0].substring(1)
      if (act === '添加活动' || act === '增加活动') {
        if (command.length !== 4) return await meta.send('请输入正确指令：添加活动 活动名称 宜详情 忌详情')
        return await eventsJson.runAdd(meta, eventPath, users, command[1], command[2], command[3], ctx)
      }
      if (act === '删除活动') {
        if (command.length !== 2) return await meta.send('请输入正确指令：删除活动 活动名称')
        return await eventsJson.runDel(meta, eventPath, users, command[1])
      }
      if (act === '确认') {
        if (command.length !== 2) return await meta.send('请输入正确指令：确认 待审核活动名称')
        return await eventsJson.confirmPendingEvent(meta, eventPath, users, command[1])
      }
      if (act === '取消') {
        if (command.length !== 2) return await meta.send('请输入正确指令：取消 待审核活动名称')
        return await eventsJson.refusePendingEvent(meta, eventPath, users, command[1])
      }
      if (act === '待审核' || act === '查看审核') {
        return await eventsJson.showPendingEvent(meta, eventPath)
      }
      if (act === '查看活动') {
        if (command.length !== 2) return await meta.send('请输入正确指令：查看活动 活动名称')
        return await eventsJson.showEvent(meta, eventPath, command[1])
      }
      return next()
    } catch (ex) {
      console.log(ex)
      return next()
    }
  })
}
