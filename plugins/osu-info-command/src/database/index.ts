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
    }
  }
}
export function apply (ctx: Context, options: Options) {
  const { transformMode, validateMode } = TryMode(options)
  ctx.model.extend('user', {
    osu: { type: 'json', initial: {} }
  })

  const cmd = ctx.command('osu')
  cmd.subcommand('.bind [username: text]')
    .option('server', '-s <server>')
    .option('mode', '-m <mode>')
    .action((argv, user) => {
      let { session, options: { server, mode } } = argv as typeof argv & { session: { user: { osu: Record<string, any>}}}
      const binded = session.user.osu
      if (!session.user.osu) session.user.osu = {}
      if (!server) return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n')
      // if (!mode && !binded?.[server]?.mode) return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`
      try {
        mode = validateMode(transformMode(mode), server)
        if (mode && !Object.values(options.server).some(server => server.mode.some(m => m === mode))) return `指定的模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`
        if (!binded[server]) binded[server] = {}
        if (mode) binded[server].mode = mode
        if (user) binded[server].user = user
        return JSON.stringify(session.user.osu)
      } catch (error) {
        return error.message
      }
    })
  cmd.subcommand('.binded')
    .action(({ session }: {session: Session & { user: { osu: Record<string, any>}}}) => JSON.stringify(session.user.osu))
  cmd.subcommand('.unbind')
    .option('server', '-s <server>')
    .action((argv) => {
      const { session, options } = argv as typeof argv & { session: { user: { osu: Record<string, any>}}}
      const { server } = options
      if (session.user.osu[server]) {
        session.user.osu[server] = {}
        if (session.user.osu.defaultServer === server) {
          session.user.osu.defaultServer = undefined
        }
      }
    })
  cmd.subcommand('bindserver <server>')
    .action(({ session }: {session: Session & {user: {osu: Record<string, any>}}}, server) => {
      if (!server) return '请指定服务器。\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n')
      server = server.trim()
      if (!session.user.osu[server].name) return '您还未绑定该服务器的用户。请先绑定！'
      session.user.osu.defaultServer = server
    })
}
