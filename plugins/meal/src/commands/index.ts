import { Context, Schema } from 'koishi'
import { Config } from '..'
import useMenu from '../composable/useMenu'
import useStringify from '../composable/useStringify'

import _interface from '../web/interface'

export const name = 'meal-commands'

export const schema: Schema<Config> = Schema.object({})

export function apply (ctx: Context, options: Config) {
  const menu = useMenu(ctx, options)
  const stringify = useStringify(ctx, options)

  const c = ctx.command('meal', '点餐')

  c.subcommand('menu', '查看菜单')
    .action(() => {
      return _interface.menu
    })
  c.subcommand('random', '随机菜单')
    .alias('吃什么', '吃什麼', '吃啥')
    .option('course', '-c')
    // .option('section', '--section [section]')
    .action(async ({ options }, ...marks) => {
      const { course } = options || { course: false }

      if (course) {
        const c = await menu.randomCourse()
        return stringify.course(c)
      } else {
        const m = await menu.randomMeal()
        return stringify.meal(m)
      }
    })
}
