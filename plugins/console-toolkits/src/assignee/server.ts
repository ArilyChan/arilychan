import { Context } from 'koishi'
import '@koishijs/plugin-console'
import { PlatformRow, AssigneeRow, SearchChannelResult } from './base'

function groupBy<Obj extends Record<string | number, string | number>, Key extends keyof Obj> (array: Obj[], key: Key) {
  return array
    .reduce((acc, cur) => {
      const curValue = cur[key]
      if (curValue === undefined) {
        return acc
      }
      acc[curValue] ||= []
      acc[curValue].push(cur)
      return acc
    }, {} as Record<Obj[Key], Obj[]>)
}

export const using = ['database']
export default function (ctx: Context) {
  const searchPlatform = async (platform: string): Promise<PlatformRow[]> => {
    const result = await ctx.database.get('channel', {
      platform: new RegExp(platform)
    }, ['id', 'platform', 'assignee'])
    if (!result.length) {
      return []
    }
    const grouped = groupBy(result, 'platform')
    return await Promise.all(Object.entries(grouped).map(async ([platform, result]) => ({
      type: 'platform',
      platform,
      selects: await Promise.all(result.map(async r => {
        const name = await ctx.bots[platform]?.getChannel(r.id)
        return ({
          ...r,
          name: name?.channelName ?? 'unknown'
        })
      }))
    })))
  }

  const searchAssignee = async (assignee: string): Promise<AssigneeRow[]> => {
    if (!assignee.length) { return [] }

    const result = await ctx.database.get('channel', {
      assignee: new RegExp(assignee)
    }, ['id', 'assignee', 'platform'])
    if (!result.length) {
      return []
    }
    const grouped = groupBy(result, 'assignee')
    return await Promise.all(Object.entries(grouped).map(async ([assignee, result]) => ({
      type: 'assignee',
      assignee,
      selects: await Promise.all(result.map(async r => {
        const name = await ctx.bots[assignee]?.getChannel(r.id)
        return ({
          ...r,
          name: name.channelName ?? 'unknown'
        })
      }))
    })))
  }

  const searchChannel = async (query: string): Promise<SearchChannelResult[]> => {
    const result = [
      ...await searchPlatform(query),
      ...(await searchAssignee(query))
    ]
    return result.filter(a => a)
  }
  const app = ctx
  ctx.using(['router'], ({ router }) => {
    router.get('/toolkit/assignee/search/:kw', async (ctx) => {
      ctx.body = await searchChannel(ctx.params.kw)
    })
    router.post('/toolkit/assignee/clearOne', async (ctx) => {
      // console.log(ctx.request.body.channel)
      const body = ctx.request.body.data
      const { platform, id } = body.channel
      try {
        // await app.database.setChannel(platform, id, { $remove: 'assignee' })
        await app.database.set('channel', {
          platform,
          id
        }, {
          assignee: null
        })
        ctx.body = {
          message: 'removed'
        }
      } catch (error) {
        ctx.body = {
          message: error.message
        }
        ctx.status = 500
      }
    })
    router.post('/toolkit/assignee/changeOne', async (ctx) => {
      // console.log(ctx.request.body.channel)
      const body = ctx.request.body.data
      const { platform, id } = body.channel
      const { assignee } = body
      try {
        await app.database.setChannel(platform, id, { assignee })
        ctx.body = {
          message: 'updated'
        }
      } catch (error) {
        ctx.body = {
          message: error.message
        }
        ctx.status = 500
      }
    })
  })
  // ctx.using(['console'], () => {
  //   ctx.console.ws.broadcast()
  //   ctx.console.ws.addListener('toolkit/assignee/searchChannel', channel => {
  //     console.log(channel)
  //   })
  // })
}
