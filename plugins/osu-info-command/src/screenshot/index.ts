import { Context, Command, Session } from 'koishi'
import injectOsuOptions from '../command-inject-options'
import TryMode from '../utils/tryMode'
import TryUser from '../utils/tryUser'
export const using = ['puppeteerCluster'] as const
export const name = 'osu-info-command-screenshot'
export function apply (app: Context, options) {
  // const logger = app.logger('osu-screenshot')
  const { transformModeOP, validateOP } = TryMode(options)
  const { tryUser } = TryUser(options)
  // @ts-expect-error we got this
  const cluster = app.puppeteerCluster
  const screenshot = async (url) => {
    const screen = await cluster.screenshot.base64(url)
    return `[CQ:image,url=base64://${screen}]`
  }

  const params = (params) => {
    return `?${new URLSearchParams(params)}`
  }

  const ops = {
    stat (op: {user: string, mode: string, server: string, session: Session}) {
      op = validateOP(transformModeOP(op), op.session)
      let { user: username, mode, server, session } = op
      username = tryUser(username, session, server)
      if (!mode) mode = options.server[server].mode[0]
      if (!username) return '需要提供用户名。'
      const ep = `${options.screenshot.base}/users/${username}/${mode || ''}${params({ server })}`
      // return ep
      return screenshot(ep)
    },
    best (op: {user: string, mode: string, server: string, session: Session, find: any}) {
      op = validateOP(transformModeOP(op), op.session)
      let { user: username, mode, server, session, find } = op
      username = tryUser(username, session, server)
      find = {
        startDate: find.from,
        endDate: find.to,
        startHoursBefore: find.last,
        endHoursBefore: undefined
      }
      if (!mode) mode = options.server[server].mode[0]
      if (!username) return '需要提供用户名。'
      return screenshot(`${options.screenshot.base}/best/${username}/${mode || ''}${params({ server, ...find })}`)
    },
    'recent-score' (op: {user: string, mode: string, server: string, session: Session}) {
      op = validateOP(transformModeOP(op), op.session)
      let { user: username, mode, server, session } = op
      username = tryUser(username, session, server)
      if (!mode) mode = options.server[server].mode[0]
      if (!username) return '需要提供用户名。'
      return screenshot(`${options.screenshot.base}/recent/${username}/${mode || ''}${params({ server })}`)
    },
    userpage (op: {user: string, server: string, session: Session}) {
      op = validateOP(transformModeOP(op), op.session)
      let { user: username, server, session } = op
      username = tryUser(username, session, server)
      if (!username) return '需要提供用户名。'
      return screenshot(`${options.screenshot.base}/userpage/${username}${params({ server })}`)
    },
    score (op: { id: any, mode: string, server: string, session: Session}) {
      op = validateOP(transformModeOP(op), op.session)
      const { mode, id, server } = op
      return screenshot(`${options.screenshot.base}/scores/${mode}/${id}${params({ server })}`)
    },
    comment () { },
    help () { return '使用方法请通过`!help screenshot`查询。' }
  }

  const oi = app.command('osu')

  const defaultWithServerCommands = [
    oi
      .subcommand('.userpage.screenshot <username:text>')
      .action((argv, username) => {
        const { options, session } = argv
        // @ts-expect-error registered later
        const { server } = options
        return ops.userpage({ user: username, server, session })
      })
  ]

  const defaultWithServerModeCommands: Command[] = [
    oi
      .subcommand('.info.screenshot <username:text>')
      .action((argv, username) => {
        const { options, session } = argv
        // @ts-expect-error registered later
        const { mode, server } = options
        return ops.stat({ user: username, mode, server, session })
      }),
    oi
      .subcommand('.recent.screenshot <username:text>')
      .action((argv, username) => {
        const { options, session } = argv
        // @ts-expect-error registered later
        const { mode, server } = options
        return ops['recent-score']({ user: username, mode, server, session })
      }),
    oi
      .subcommand('.best.screenshot <username:text>')
      .option('from', '<date>')
      .option('to', '<date>')
      .option('last', '<hours>')
      .action((argv, username) => {
        const { options, session } = argv
        // @ts-expect-error registered later
        const { mode, server, from, to, last } = options
        return ops.best({ user: username, mode, server, session, find: { from, to, last } })
      }),
    oi
      .subcommand('.score.screenshot <id:number>')
      .action((argv, id) => {
        const { options, session } = argv
        // @ts-expect-error registered later
        const { mode, server } = options
        return ops.score({ id, mode, server, session })
      })
  ]

  defaultWithServerCommands.forEach((command) => injectOsuOptions(command, ['server']))
  defaultWithServerModeCommands.forEach((command) => injectOsuOptions(command, ['mode', 'server']))
}
