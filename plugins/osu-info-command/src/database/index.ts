import { Context, Session } from 'koishi'
// import injectOsuOptions from '../command-inject-options'
import TryMode from '../utils/tryMode'
import { Options } from '../index'
export const name = 'osu-info-command-extend-database'
type UserServerBind = Record<string, {
  mode?: string,
  user?: string
}>
declare module 'koishi' {
  // waht do you mean unused??
  // eslint-disable-next-line no-unused-vars
  interface User {
    osu: UserServerBind
    & {
      defaultServer?: keyof UserServerBind
    },
    osu2: string
  }
}
export function apply (ctx: Context, options: Options) {
  const { transformMode, validateMode } = TryMode(options)
  ctx.model.extend('user', {
    osu: { type: 'json', initial: {} }
  })

  const cmd = ctx.command('osu')
  cmd.subcommand('.bind <username: text>')
    .option('server', '-s [server]')
    .option('mode', '-m [mode]')
    .userFields(['osu', 'osu2', 'authority'])
    .action(async (argv, user) => {
      const { session } = argv
      let { options: { server, mode } } = argv
      if (!server) return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n')
      // if (!mode && !binded?.[server]?.mode) return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`
      try {
        mode = validateMode(transformMode(mode), server)
        console.log({ mode, user, server })
        if (mode && !Object.values(options.server).some(server => server.mode.some(m => m === mode))) return `指定的模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`
        if (!session.user.osu[server]) session.user.osu[server] = {}
        if (mode) session.user.osu[server].mode = mode
        if (user) session.user.osu[server].user = user
        return JSON.stringify(session.user.osu)
      } catch (error) {
        if (session.user.authority > 2) { return error.stack }
        return error.message
      }
    })
  cmd.subcommand('.binded')
    .userFields(['authority', 'osu'])
    .action(({ session }) =>
      JSON.stringify(session.user.osu)
    )
  cmd.subcommand('.unbind')
    .option('server', '-s <server>')
    .userFields(['authority', 'osu'])
    .action((argv) => {
      const { session, options } = argv
      const { server } = options
      if (session.user.osu[server]) {
        session.user.osu[server] = {}
        if (session.user.osu.defaultServer === server) {
          session.user.osu.defaultServer = undefined
        }
      }
    })
  cmd.subcommand('bindserver <server>')
    .userFields(['authority', 'osu'])
    .action(({ session }, server) => {
      if (!server) return '请指定服务器。\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n')
      server = server.trim()
      // @ts-expect-error optional chained
      if (!session.user.osu?.[server]?.name) return '您还未绑定该服务器的用户。请先绑定！'
      session.user.osu.defaultServer = server
    })
}
