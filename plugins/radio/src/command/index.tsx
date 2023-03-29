import api from '../server/api'
import server from '../server/express'
import { unescapeSpecialChars } from '../utils'
import { Fragment, Context } from 'koishi'
import type {} from 'koishi-plugin-express'
import { Uploader } from '../types'
import { Config } from '../index'

export const name = 'arilychan-radio-commands'
export { schema } from '../index'
export const apply = async (ctx: Context, options: Config) => {
  const storage = await api(ctx, options)
  ctx.using(['express'], function arilychanRadioWebService ({ express, _expressHttpServer }) {
    express.use(options.web.path, server(options, storage, _expressHttpServer))
  })
  const command = ctx.command('radio')
  command
    .subcommand('.preview <music:text>')
    .alias('试听')
    .usage('试听曲目')
    .action(async (argv, text) => {
      try {
        const argString = unescapeSpecialChars(text)
        const beatmapInfo = await storage.search(argString)
        return <record file={beatmapInfo.previewMp3}></record>
      } catch (ex) {
        return <>
          <at id={argv.session?.userId}></at>
          {ex}
        </>
      }
    })
  command
    .subcommand('.queue <music:text>')
    .alias('点歌')
    .alias('add')
    .alias('queue.add')
    .usage('点歌')
    .action(async (argv, text) => {
      const argString = unescapeSpecialChars(text)
      try {
        const beatmapInfo = await storage.search(argString)
        beatmapInfo.uploader = argv.session?.userId as Uploader

        // beatmapInfo.uuid = uuidv4()
        const reply: Fragment = []

        reply.push(<at id={argv.session?.userId}></at>)
        reply.push('搜索到曲目：' + beatmapInfo.artistU + ' - ' + beatmapInfo.titleU + '\n')
        // 如果超出时长，则拒绝添加
        if (!storage.withinDurationLimit(beatmapInfo)) return reply + '这首歌太长了，请选择短一些的曲目'
        if (!beatmapInfo.audioFileName) reply.push('小夜没给音频，只有试听\n')
        // 查重
        const oneHourBefore = new Date(Date.now() - 60 * 60 * 1000)
        const p = await ctx.database.get('playlist', {
          created: {
            $gte: oneHourBefore
          },
          sid: beatmapInfo.sid,
          uploader: argv.session?.userId as Uploader | undefined
        })
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
        reply.push('点歌成功！sid：' + beatmapInfo.sid + '，歌曲将会保存 ' + options.expire + ' 天')
        reply.push('\n电台地址：' + options.web.host + options.web.path)
        return reply
      } catch (ex) {
        if (ex.stack) console.warn(ex.stack)
        return <>
          <at id={argv.session?.userId}></at>
          {(ex.message || ex)}
        </>
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
      if (!argv.session?.userId) return
      const argString = unescapeSpecialChars(text)
      try {
        if (!argString) {
          return <>
          <at id={argv.session.userId}></at>
          请指定sid
        </>
        }
        const sid = parseInt(argString)
        if (!sid) {
          return <>
          <at id={argv.session.userId}></at>
          sid应该是个正整数
        </>
        }

        const expiredDate = new Date(Date.now() - options.expire * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000)

        let p = await ctx.database.get('playlist', {
          created: {
            $gte: expiredDate
          },
          sid,
          uploader: argv.session.userId as Uploader | undefined
        })

        if (!p.length) throw new Error('播放列表中没有该曲目')
        if ((await argv.session.getUser()).authority > 2) {
          // 管理员直接删除所有该sid曲目
          await Promise.all(p.map((song) => {
            if (!argv.session?.userId) return undefined
            return storage.delete(song, argv.session.userId as Uploader)
          }))
        } else {
          // 删除自己上传的所有该sid曲目
          p = p.filter(record => record.uploader === argv.session?.userId)
          if (p.length <= 0) throw new Error('非上传者无法删除该曲目')
          await Promise.all(p.map((song) => {
            if (!argv.session?.userId) return undefined
            return storage.delete(song, argv.session.userId as Uploader)
          }))
        }

        return <>
          <at id={argv.session?.userId}></at>
          删除成功！
        </>
      } catch (ex) {
        return <>
          <at id={argv.session?.userId}></at>
          {ex.message}
        </>
      }
    })
  command
    .subcommand('.broadcast <message:text>')
    .alias('广播')
    .action(async (argv, text) => {
      const argString = unescapeSpecialChars(text)
      try {
        const authority = (await argv.session?.getUser())?.authority || 0
        if (authority > 2) {
          return <>
          <at id={argv.session?.userId}></at>
          只有管理员才能发送广播消息
        </>
        }
        await storage.broadcast(argv.session?.userId as Uploader, argString)
        return <>
          <at id={argv.session?.userId}></at>
          已发送广播
        </>
      } catch (ex) {
        return <>
          <at id={argv.session?.userId}></at>
          {ex.message}
        </>
      }
    })
}
