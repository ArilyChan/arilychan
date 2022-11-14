import { flags, Flags } from '../declares'
import { Context, Schema } from 'koishi'
import { Config } from '..'
import useRandomMeal from '../composable/useRandomMeal'
import useRandomCourse from '../composable/useRandomCourse'
import useStringify from '../composable/useStringify'

import _interface from '../web/interface'

export const name = 'meal-commands'

export const schema: Schema<Config> = Schema.object({})

export function apply (ctx: Context, options: Config) {
  const stringify = useStringify(ctx, options)('element')
  if (!stringify) return

  const randomCourse = useRandomCourse(ctx, options)
  const randomMeal = useRandomMeal(ctx, options)

  const c = ctx.command('meal', '点餐')

  c.subcommand('menu', '查看菜单')
    .action(() => {
      return _interface.menu
    })
  c.subcommand('random [...disabledFlags]', '随机菜单')
    .alias('吃什么', '吃什麼', '吃啥')
    .option('course', '-c')
    // .option('section', '--section [section]')
    .action(async ({ options }, ...disabledFlags) => {
      const { course } = options || { course: false }
      const existedFlags = disabledFlags.filter(mark => flags.includes(mark as Flags)) as Flags[]
      if (course) {
        const c = await randomCourse(existedFlags.length ? existedFlags : undefined)
        return stringify.course(c)
      } else {
        const m = await randomMeal(existedFlags.length ? existedFlags : undefined)
        return stringify.meal(m)
      }
    })
}
