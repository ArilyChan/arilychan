import { Bot, Context, noop } from 'koishi'
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
        return ({
          ...r,
          name: await nameOfChannelOrGuild(r.id, r)
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
        return ({
          ...r,
          name: await nameOfChannelOrGuild(r.id, r)
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
        removed(ctx)
      } catch (error) {
        serverSideError(ctx, error.message)
      }
    })

    router.post('/toolkit/assignee/change', async (ctx) => {
      const body = ctx.request.body
      const { assignee } = body
      try {
        await app.database.set('channel', body.query, { assignee })
        done(ctx)
      } catch (error) {
        serverSideError(ctx, error.message)
      }
    })
  })
  async function nameOfChannelOrGuild (channelOrGuildId: string, supplementaryQueries?: {platform: Bot['platform'], assignee: Bot['selfId']}) {
    const bots = ctx.bots.filter(b => supplementaryQueries ? supplementaryQueries.assignee === b.selfId || supplementaryQueries.platform === b.platform : true)
    for (const bot of bots) {
      const result = await Promise.all([bot.getGuild(channelOrGuildId).catch(noop), bot.getChannel(channelOrGuildId).catch(noop)])
      console.log(result)
      // if (result) return result
    }
    return '?'
  }
}
function serverSideError (ctx: {body: any, status: number}, message: string, status = 500) {
  ctx.body = { message }
  ctx.status = status
  return ctx
}

function done (ctx:{body: any}) {
  ctx.body = {
    message: 'done'
  }
}
function removed (ctx:{body: any}) {
  ctx.body = {
    message: 'removed'
  }
}
