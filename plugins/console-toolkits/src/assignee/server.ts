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
  async function searchPlatform (platform: string): Promise<PlatformRow[]> {
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
      selects: await Promise.all(result.map(async (r) => {
        const name = await ctx.bots[platform]?.getChannel(r.id)
        return ({
          ...r,
          name: name?.channelName ?? 'unknown'
        })
      }))
    })))
  }

  async function searchAssignee (assignee: string): Promise<AssigneeRow[]> {
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
      selects: await Promise.all(result.map(async (r) => {
        const name = await ctx.bots[assignee]?.getChannel(r.id)
        return ({
          ...r,
          name: name?.channelName ?? 'unknown'
        })
      }))
    })))
  }

  async function searchChannel (query: string): Promise<SearchChannelResult[]> {
    const result = [
      ...await searchPlatform(query),
      ...await searchAssignee(query)
    ]
    return result.filter(a => a)
  }
  const app = ctx
  ctx.using(['router'], ({ router }) => {
    router.get('/toolkit/assignee/search/:kw', async (ctx) => {
      ctx.body = await searchChannel(ctx.params.kw)
    })
    router.post('/toolkit/assignee/clear', async (ctx) => {
      const body = ctx.request.body
      try {
        await app.database.set('channel', body.query, { assignee: null })
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

    router.post('/toolkit/assignee/change', async (ctx) => {
      const body = ctx.request.body
      const { assignee } = body
      try {
        await app.database.set('channel', body.query, { assignee })
        ctx.body = {
          message: 'done'
        }
      } catch (error) {
        ctx.body = {
          message: error.message
        }
        ctx.status = 500
      }
    })
  })
}
