import { Context, Schema } from 'koishi'
import useMenu from '../composable/useMenu'
import { CourseCompositionType, MealAsset } from '../declares'

import _interface from '../web/interface'

export const name = 'meal-commands'

export const courseType: Record<CourseCompositionType, string> = {
  appetizer: '🍮',
  soup: '🥣',
  'main-dish': '🍽️',
  desert: '🧁'
}

export interface Config {
}

const renderMealDescription = (stringTemplate: string[], assets: Array<MealAsset | undefined>) => {
  return stringTemplate.reduce((acc, item, index) => {
    return (
      acc +
      item +
      (assets[index] &&
        /* html */`<image url=${(assets[index] as MealAsset).file || (assets[index] as MealAsset).base64 || ''}></image>`
      ) || ''
    )
  }, '')
}

export const schema: Schema<Config> = Schema.object({})

export function apply (ctx: Context, options: Config) {
  const menu = useMenu(ctx, options)

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
        if (!c) return 'sth. went wrong'
        return /* html */`
          <p>今天吃 ${c.name}</p>
          ${c.compositions.map(course => course.meal && /* html */`
            <p>
              <text>${courseType[course.type]} ${course.meal.name}</text>
              <text>${renderMealDescription(course.meal.description, course.meal.assets)}</text>
            </p>
          `).filter(Boolean)}
        `
      } else {
        const m = await menu.randomMeal()
        if (!m) return 'sth. went wrong'
        return /* html */`
          <text>今天吃 ${m.name}</text>
          <text>${renderMealDescription(m.description, m.assets)}</text>
        `
      }
    })
}
