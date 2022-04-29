'use strict'
// const manual = require('sb-bot-manual')
const api = require('./lib/server/api')
const server = require('./lib/server/server')
const aggeregations = require('./lib/server/database/aggregations')
const utils = require('./lib/utils')
const { v4: uuidv4 } = require('uuid')
const { Schema } = require('koishi')

// const defaultOptions = {
//   // duration: 60 * 10 + 1,
//   expire: 7,
//   db: {},
//   web: {
//     path: '/radio'
//   }
// }

module.exports.name = 'arilychan-radio'
module.exports.schema = Schema.object({
  // duration: Schema.number().usage('')
  expire: Schema.number().description('点歌有效期限（天）').default(7),
  db: Schema.object({
    uri: Schema.string().description('mongodb connect uri')
  }).description('currently running on custom server'),
  web: Schema.object({
    path: Schema.string().description('网页地址，运行在express上。需要websocket服务。').default('/radio')
  })
})
module.exports.apply = async (ctx, options) => {
  options = new Schema(options)
  const storage = await api(options)
  ctx.using(['express'], function arilychanRadioWebService ({ express, _expressHttpServer }) {
    express.use(options.web.path, server(options, storage, _expressHttpServer))
  })
  const command = ctx.command('radio')
  command
    .subcommand('.preview <music:text>')
    .alias('试听')
    .usage('试听曲目')
    .action(async (session, text) => {
      try {
        const argString = utils.unescapeSpecialChars(text)
        const beatmapInfo = await storage.search(argString)
        return `[CQ:record,file=${beatmapInfo.previewMp3}]`
      } catch (ex) {
        return `[CQ:at,qq=${session.userId}]\n` + ex
      }
    })
  command
    .subcommand('.queue <music:text>')
    .alias('点歌')
    .alias('add')
    .alias('queue.add')
    .usage('点歌')
    .action(async (argv, text) => {
      const argString = utils.unescapeSpecialChars(text)
      try {
        const beatmapInfo = await storage.search(argString)
        beatmapInfo.uploader = {
          id: argv.session.userId,
          nickname: argv.session.sender.nickname
        }
        beatmapInfo.uuid = uuidv4()
        let reply = `[CQ:at,id=${argv.session.userId}]\n`
        reply += '搜索到曲目：' + beatmapInfo.artistU + ' - ' + beatmapInfo.titleU + '\n'
        // 如果超出时长，则拒绝添加
        if (!storage.withinDurationLimit(beatmapInfo)) return reply + '这首歌太长了，请选择短一些的曲目'
        if (!beatmapInfo.audioFileName) reply += '小夜没给音频，只有试听\n'
        // 查重
        const now = new Date()
        // const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)
        const oneHourBefore = new Date(now - 60 * 60 * 1000)
        const p = await storage.database.collection.aggregate([
          ...aggeregations.newerThan(oneHourBefore),
          { $match: { sid: beatmapInfo.sid, uploader: { id: argv.session.userId } } }
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
        return reply
      } catch (ex) {
        if (ex.stack) console.warn(ex.stack)
        return `[CQ:at,id=${argv.session.userId}]\n` + (ex.message || ex)
      }
    })
  command
    .subcommand('.cancel <music:text>')
    .alias('delete')
    .alias('remove')
    .alias('queue.delete')
    .alias('queue.remove')
    .alias('queue.cancel')
    .alias('取消')
    .alias('取消点歌')
    .alias('删歌')
    .usage('取消已点的歌曲')
    .action(async (argv, text) => {
      const argString = utils.unescapeSpecialChars(text)
      try {
        if (!argString) return `[CQ:at,id=${argv.session.userId}]\n请指定sid`
        const sid = parseInt(argString)
        if (!sid) return `[CQ:at,id=${argv.session.userId}]\nsid应该是个正整数`

        const now = new Date()
        const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)

        let p = await storage.database.collection.aggregate([
          ...aggeregations.newerThan(expiredDate),
          { $match: { sid } }
        ]).toArray()

        if (!p.length) throw new Error('播放列表中没有该曲目')
        if (options.isAdmin(argv)) {
          // 管理员直接删除所有该sid曲目
          await Promise.all(p.map((song) => {
            return storage.delete(song, { id: argv.session.userId, nickname: argv.session.sender.nickname })
          }))
        } else {
          // 删除自己上传的所有该sid曲目
          p = p.filter(record => record.uploader.id === argv.session.userId)
          if (p.length <= 0) throw new Error('非上传者无法删除该曲目')
          await Promise.all(p.map((song) => {
            return storage.delete(song, { id: argv.session.userId, nickname: argv.session.sender.nickname })
          }))
        }
        return `[CQ:at,id=${argv.session.userId}]\n删除成功！`
      } catch (ex) {
        return `[CQ:at,id=${argv.session.userId}]\n` + ex.message
      }
    })
  command
    .subcommand('.broadcast <message:text>')
    .alias('广播')
    .action(async (argv, text) => {
      const argString = utils.unescapeSpecialChars(text)
      try {
        if (!options.isAdmin(argv)) return `[CQ:at,id=${argv.session.userId}]\n只有管理员才能发送广播消息`
        await storage.broadcast(argv.session.userId, argString)
        return `[CQ:at,id=${argv.session.userId}]\n已发送广播`
      } catch (ex) {
        return `[CQ:at,id=${argv.session.userId}]\n` + ex
      }
    })

  //   ctx.middleware(async(argv, next) => {
  //     try {
  //       const userId = argv.session.userId
  //       const command = argv.session.content.trim().split(' ').filter(item => item !== '')
  //       if (command.length < 1) return next()
  //       if (command[0].substring(0, 1) !== '!' && command[0].substring(0, 1) !== '！') return next()
  //       if (command[0].length < 2) return next()
  //       const act = command[0].substring(1)
  //       const argString = (command.length > 1) ? utils.unescapeSpecialChars(command.slice(1).join(' ')) : ''
  //       switch (act) {
  //         case '试听':
  //           try {
  //             const beatmapInfo = await storage.search(argString)
  //             return `[CQ:record,file=${beatmapInfo.previewMp3}]`
  //           } catch (ex) {
  //             return `[CQ:at,qq=${userId}]\n` + ex
  //           }
  //         case '点歌':
  //         case 'radio.queue':
  //         case 'radio.add':
  //         case 'queue.add':
  //           try {
  //             const beatmapInfo = await storage.search(argString)
  //             beatmapInfo.uploader = {
  //               id: userId,
  //               nickname: argv.session.sender.nickname
  //             }
  //             beatmapInfo.uuid = uuidv4()
  //             let reply = `[CQ:at,id=${userId}]\n`
  //             reply += '搜索到曲目：' + beatmapInfo.artistU + ' - ' + beatmapInfo.titleU + '\n'
  //               // 如果超出时长，则拒绝添加
  //             if (!storage.withinDurationLimit(beatmapInfo)) return reply + '这首歌太长了，请选择短一些的曲目'
  //             if (!beatmapInfo.audioFileName) reply += '小夜没给音频，只有试听\n'
  //               // 查重
  //             const now = new Date()
  //               // const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)
  //             const oneHourBefore = new Date(now - 60 * 60 * 1000)
  //             const p = await storage.database.collection.aggregate([
  //               ...aggeregations.newerThan(oneHourBefore),
  //               { $match: { sid: beatmapInfo.sid, uploader: { id: userId } } }
  //             ]).toArray()
  //             if (p.length) {
  //               // 当点的歌之前点过，而且是同一个人点，则删除旧的再添加新的
  //               // @arily 建议一小时之内点过的拒绝再次点歌。一小时以上的直接插入就可以。历史会按照sid去重
  //               throw new Error('这首歌之前已经被你点过了')
  //             }
  //             // 当点的歌之前点过，但不是同一个人点，则直接添加，重复歌曲由客户端去filter
  //             // @arily 前端不负责这些逻辑
  //             // reply += '这首歌之前已经被其他人点过了，'
  //             // }
  //             await storage.add(beatmapInfo)
  //             reply += '点歌成功！sid：' + beatmapInfo.sid + '，歌曲将会保存 ' + options.expire + ' 天'
  //             reply += '\n电台地址：' + options.web.host + options.web.path
  //             return reply
  //           } catch (ex) {
  //             return `[CQ:at,id=${userId}]\n` + ex
  //           }
  //         case '广播':
  //         case 'radio.broadcast':
  //           try {
  //             if (!options.isAdmin(argv)) return `[CQ:at,id=${userId}]\n只有管理员才能发送广播消息`
  //             await storage.broadcast(userId, argString)
  //             return `[CQ:at,id=${userId}]\n已发送广播`
  //           } catch (ex) {
  //             return `[CQ:at,id=${userId}]\n` + ex
  //           }
  //         case '删歌':
  //         case 'radio.delete':
  //         case 'radio.remove':
  //         case 'radio.cancel':
  //         case 'queue.delete':
  //         case 'queue.remove':
  //         case 'queue.cancel':
  //           try {
  //             if (!argString) return `[CQ:at,id=${userId}]\n请指定sid`
  //             const sid = parseInt(argString)
  //             if (!sid) return `[CQ:at,id=${userId}]\nsid应该是个正整数`

  //             const now = new Date()
  //             const expiredDate = new Date(now - options.removeAfterDays * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)

  //             let p = await storage.database.collection.aggregate([
  //               ...aggeregations.newerThan(expiredDate),
  //               { $match: { sid } }
  //             ]).toArray()

//             if (!p.length) throw new Error('播放列表中没有该曲目')
//             if (options.isAdmin(argv)) {
//               // 管理员直接删除所有该sid曲目
//               await Promise.all(p.map((song) => {
//                 storage.delete(song, { id: userId, nickname: argv.session.sender.nickname })
//               }))
//             } else {
//               // 删除自己上传的所有该sid曲目
//               p = p.filter(record => record.uploader.id === userId)
//               if (p.length <= 0) throw new Error('非上传者无法删除该曲目')
//               await Promise.all(p.map((song) => {
//                 storage.delete(song, { id: userId, nickname: argv.session.sender.nickname })
//               }))
//             }
//             return `[CQ:at,id=${userId}]\n删除成功！`
//           } catch (ex) {
//             return `[CQ:at,id=${userId}]\n` + ex.message
//           }
//         default:
//           return next()
//       }
//     } catch (ex) {
//       console.log(ex)
//       return next()
//     }
//   })
}

// const radio = manual.section('arilychan-radio')
// radio
//   .name('小阿日电台')
//   .usage('可以和其他人一起听的串流电台')
//   .tag('广播').tag('调频').tag('中波')

// radio
//   .entry('试听')
//   .usage('!试听 <关键词 | osu beatmapset id>')

// radio
//   .entry('queue')
//   .name('点歌')
//   .usage('点好的歌会在上一首歌播放完后播放')

// .usage('!删歌 <关键词 | osu beatmapset id>')
//   .usage('!radio.delete <关键词 | osu beatmapset id>')
//   .usage('!radio.remove <关键词 | osu beatmapset id>')
//   .usage('!radio.cancel <关键词 | osu beatmapset id>')
//   .usage('!queue.delete <关键词 | osu beatmapset id>')
//   .usage('!queue.remove <关键词 | osu beatmapset id>')
//   .usage('!queue.cancel <关键词 | osu beatmapset id>')

// radio
//   .entry('delete-queue')
//   .name('删歌')
//   .usage('取消点播（正在播放中会被强制切到下一首）')

// .usage('!点歌 <关键词 | osu beatmapset id>')
//   .usage('!radio.queue <关键词 | osu beatmapset id>')
//   .usage('!radio.add <关键词 | osu beatmapset id>')
//   .usage('!queue.add <关键词 | osu beatmapset id>')

// radio
//   .entry('broadcast')
//   .name('广播')
//   .detail('[管理员权限功能]')
//   .usage('向所有听众推送一条消息')

// .usage('!广播 <...something>')
//   .usage('!radio.broadcast <...something>')
