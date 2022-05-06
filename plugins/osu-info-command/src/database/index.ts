import { Context } from 'koishi'
// import injectOsuOptions from '../command-inject-options'
import TryMode from '../utils/tryMode'
import { Options } from '../index'
export const name = 'osu-info-command-extend-database'
type UserServerBind = Record<string, {
  mode?: string
}>
declare module 'koishi' {
  // eslint-disable-next-line no-unused-vars
  interface User {
    osu: UserServerBind & {
      defaultServer?: keyof UserServerBind
    }
  }
}
export function apply (ctx: Context, options: Options) {
  const { transformMode } = TryMode(options)
  ctx.model.extend('user', {
    osu: { type: 'json', initial: {} }
  })

  const cmd = ctx.command('osu')
  cmd.subcommand('.bind [username: text]')
    .option('server', '-s <server>')
    .option('mode', '-m <mode>')
    .action((argv, user) => {
      let { session, options: { server, mode } } = argv
      // @ts-expect-error extended before (line 14)
      const binded = session.user.osu
      if (!server) return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n')
      if (!mode && !binded[server]?.mode) return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`
      mode = transformMode(mode)
      if (!Object.values(options.server).some(server => server.mode.some(m => m === mode))) return `模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`
      if (!binded[server]) binded[server] = {}
      if (mode) binded[server].mode = mode
      if (user) binded[server].user = user
      // @ts-expect-error refer to koishi doc
      return JSON.stringify(session.user.osu)
    })
  cmd.subcommand('.binded')
  // @ts-expect-error refer to koishi doc
    .action(({ session }) => JSON.stringify(session.user.osu))
}
