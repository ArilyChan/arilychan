import { Context } from 'koishi'
import injectOsuOptions from '../command-inject-options'
export const name = 'osu-info-command-text'

export function apply (ctx: Context) {
  const oi = ctx.command('osu')

  const info = oi
    .subcommand('.info.text [<username:text]')
    .action((argv, username) => {
      const { options } = argv
      // @ts-expect-error registered later
      const { mode, server, from } = options
      return JSON.stringify({ user: username, mode, server, from })
    })

    ;[info].forEach((command) => injectOsuOptions(command, ['mode', 'server']))
}
