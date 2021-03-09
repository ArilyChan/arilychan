'use strict'

const api = require('./lib/server/api')
const server = require('./lib/server/server')
const aggeregations = require('./lib/server/database/aggregations')
const utils = require('./lib/utils')
const { v4: uuidv4 } = require('uuid')

const defaultOptions = {
  duration: 60 * 10 + 1,
  expire: 7,
  db: {}
}

module.exports.name = 'arilychan-radio'
module.exports.webPath = '/radio'
module.exports.init = (option) => api({ ...defaultOptions, ...option })
module.exports.webView = (option, storage, http) => server({ ...defaultOptions, ...option }, storage, http)

module.exports.apply = (ctx, options, storage) => {
  options = { ...defaultOptions, ...options }
  ctx.middleware(async (meta, next) => {
    try {
      const userId = meta.userId
      const command = meta.message.trim().split(' ').filter(item => item !== '')
      if (command.length < 1) return next()
      if (command[0].substring(0, 1) !== '!' && command[0].substring(0, 1) !== '！') return next()
      if (command[0].length < 2) return next()
      const act = command[0].substring(1)
      const argString = (command.length > 1) ? utils.unescapeSpecialChars(command.slice(1).join(' ')) : ''
      switch (act) {
        case '点歌':
        case 'radio.queue':
        case 'radio.add':
        case 'queue.add':
          try {
            const beatmapInfo = await storage.search(argString)
            beatmapInfo.uploader = {
              id: userId,
              nickname: meta.sender.nickname
            }
            beatmapInfo.uuid = uuidv4()
            let reply = `[CQ:at,qq=${userId}]\n`
            reply += '搜索到曲目：' + beatmapInfo.artistU + ' - ' + beatmapInfo.titleU + '\n'
            // 如果超出时长，则拒绝添加
            if (!storage.withinDurationLimit(beatmapInfo)) return await meta.$send(reply + '这首歌太长了，请选择短一些的曲目')
            if (!beatmapInfo.audioFileName) reply += '小夜没给音频，只有试听\n'
            // 查重
            const now = new Date()
            // const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)
            const oneHourBefore = new Date(now - 60 * 60 * 1000)
            const p = await storage.database.collection.aggregate([
              ...aggeregations.newerThan(oneHourBefore),
              { $match: { sid: beatmapInfo.sid, uploader: { id: userId } } }
            ]).toArray()
            if (p.length) {
              // 当点的歌之前点过，而且是同一个人点，则删除旧的再添加新的
              // @arily 建议一小时之内点过的拒绝再次点歌。一小时以上的直接插入就可以。历史会按照sid去重
              throw new Error('这首歌之前已经被你点过了')
            }
            // 当点的歌之前点过，但不是同一个人点，则直接添加，重复歌曲由客户端去filter
            // @arily 前端不负责这些逻辑
            // reply += '这首歌之前已经被其他人点过了，'
            // }
            await storage.add(beatmapInfo)
            reply += '点歌成功！sid：' + beatmapInfo.sid + '，歌曲将会保存 ' + options.expire + ' 天'
            reply += '\n电台地址：' + options.web.host + options.web.path
            return await meta.$send(reply)
          } catch (ex) {
            return await meta.$send(`[CQ:at,qq=${userId}]\n` + ex)
          }
        case '广播':
        case 'radio.broadcast':
          try {
            if (!options.isAdmin(meta)) return await meta.$send(`[CQ:at,qq=${userId}]\n只有管理员才能发送广播消息`)
            await storage.broadcast(userId, argString)
            return await meta.$send(`[CQ:at,qq=${userId}]\n已发送广播`)
          } catch (ex) {
            return await meta.$send(`[CQ:at,qq=${userId}]\n` + ex)
          }
        case '删歌':
        case 'radio.delete':
        case 'radio.remove':
        case 'radio.cancel':
        case 'queue.delete':
        case 'queue.remove':
        case 'queue.cancel':
          try {
            if (!argString) return await meta.$send(`[CQ:at,qq=${userId}]\n请指定sid`)
            const sid = parseInt(argString)
            if (!sid) return await meta.$send(`[CQ:at,qq=${userId}]\nsid应该是个正整数`)

            const now = new Date()
            const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)

            let p = await storage.database.collection.aggregate([
              ...aggeregations.newerThan(expiredDate),
              { $match: { sid } }
            ]).toArray()

            if (!p.length) throw new Error('播放列表中没有该曲目')
            if (options.isAdmin(meta)) {
              // 管理员直接删除所有该sid曲目
              await Promise.all(p.map((song) => {
                storage.delete(song, { id: userId, nickname: meta.sender.nickname })
              }))
            } else {
              // 删除自己上传的所有该sid曲目
              p = await storage.database.collection.aggregate([
                ...aggeregations.newerThan(expiredDate),
                { match: { sid }, uploader: { id: userId } }
              ]).toArray()
              if (p.length <= 0) throw new Error('非上传者无法删除该曲目')
              await Promise.all(p.map((song) => {
                storage.delete(song, { id: userId, nickname: meta.sender.nickname })
              }))
            }
            return await meta.$send(`[CQ:at,qq=${userId}]\n删除成功！`)
          } catch (ex) {
            return await meta.$send(`[CQ:at,qq=${userId}]\n` + ex.message)
          }
        default: return next()
      }
    } catch (ex) {
      console.log(ex)
      return next()
    }
  })
}
