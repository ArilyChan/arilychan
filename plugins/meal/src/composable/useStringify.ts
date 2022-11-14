import { Context } from 'koishi'
import { Config } from '..'
import { CourseCompositionType, MealAsset } from '../declares'
import { ReturnValue as ReturnedCourse } from './useRandomCourse'
import { ReturnValue as ReturnedMeal } from './useRandomMeal'

export const courseType: Record<CourseCompositionType, string> = {
  appetizer: '🍮',
  soup: '🥣',
  'main-dish': '🍽️',
  desert: '🧁'
}

export const renderMealDescription = (stringTemplate: string[], assets: Array<MealAsset | undefined>) => {
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
export type StringifyType = 'element' | 'string'
export default (ctx: Context, options: Config) =>
  (as: StringifyType) => {
    if (as === 'element') {
      return {
        meal (m: Awaited<ReturnedMeal>) {
          if (!m) return 'sth. went wrong'

          return /* html */`
              <text>今天吃 ${m.name}</text>
              <text>${renderMealDescription(m.description, m.assets)}</text>
            `
        },
        course (c: Awaited<ReturnedCourse>) {
          if (!c) return 'sth. went wrong'
          return /* html */`
              <p>今天吃 ${c.name}</p>
              ${c.compositions.map(course => course.meal && /* html */`
                <p>
                  <text>${courseType[course.type]} ${course.meal.name}</text>
                  <text>${renderMealDescription(course.meal.description, course.meal.assets)}</text>
                </p>
              `).filter(Boolean)
              }
            `
        }
      }
    } else if (as === 'string') {
      return {
        meal (m: Awaited<ReturnedMeal>) {
          if (!m) return 'sth. went wrong'
          return [
              `今天吃 ${m.name}`,
              m.description.join('\n')
          ].join('\n')
        },
        course (c: Awaited<ReturnedCourse>) {
          if (!c) return 'sth. went wrong'
          return [
              `今天吃 ${c.name}`,
              ...c.compositions.map(course => (course.meal && [
                `${courseType[course.type]} ${course.meal.name}`,
                course.meal.description.join('\n')
              ]) || [])
          ].join('\n')
        }
      }
    }
  }
