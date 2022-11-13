import { Context, Schema } from 'koishi'
import useMenu from '../composable/useMenu'

import _interface from '../web/interface'

export const name = 'meal-commands'

export interface Config {

}

export const schema: Schema<Config> = Schema.object({})

export function apply (ctx: Context, options: Config) {
  const menu = useMenu(ctx, options)

  const c = ctx.command('meal', '点餐')

  c.subcommand('menu', '查看菜单')
    .action(() => {
      return _interface.menu
    })
  c.subcommand('random [...marks]', '随机菜单')
    .alias('吃什么', '吃什麼', '吃啥')
    .option('course', '-c')
    // .option('section', '--section [section]')
    .action(async (meta, ...marks) => {
      const { options: { course } } = meta
      // const _section = section as string

      if (course) {
        return await menu.randomCourse()
      } else {
        return await menu.randomMeal()
      }
    })
}
