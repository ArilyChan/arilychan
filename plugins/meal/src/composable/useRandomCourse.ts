import type { Flags } from '../declares'
import { Context } from 'koishi'
import { Config } from '..'
import { random } from './useUtils'

export default (ctx: Context, options: Config) => async (disabledFlags: Flags[] = ['nsfw', 'disabled'], section?: string | number) => {
  const courses = await ctx.database.get('course', {})
  const filteredCourses = courses.filter((item) => item.flags.every(flag => !disabledFlags.includes(flag)))

  if (!filteredCourses.length) return null

  const randomCourse = random(filteredCourses)
  const items = await ctx.database.get('course-item', {
    courseId: randomCourse.id
  })
  // const meals = await Promise.all(items.map(item => ctx.database.get('meal', {
  //   id: item.mealId
  // })))

  const meals = await ctx.database.get('meal', {
    id: {
      $in: items.map(i => i.id)
    }
  })

  const assetIds = meals.reduce<number[]>((acc, m) => {
    acc.concat(m.assets.map(i => parseInt(i)))
    return acc
  }, [])

  const assets = await ctx.database.get('meal-asset', {
    id: {
      $in: assetIds
    }
  })

  const populated = meals.map(m => {
    return {
      ...m,
      assets: m.assets.map(key => assets.find(a => a.id.toString() === key))
    }
  })

  return {
    ...randomCourse,
    compositions: items.map((item, index) => ({
      ...item,
      meal: populated.find(m => m.id === item.courseId)
    }))
  }
}
