import type { Flags } from '../declares'
import { Context } from 'koishi'
import { Config } from '..'

const random = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

export default (ctx: Context, options: Config) => {
  async function randomMeal (disabledFlags: Flags[] = ['nsfw', 'disabled']) {
    const meals = await ctx.database.get('meal', {}, ['id', 'flags'])
    const filtered = meals.filter((item) => item.flags.every(flag => !disabledFlags.includes(flag)))

    if (!meals.length) return null

    const randomMeal = random(filtered)

    const meal = await ctx.database.get('meal', { id: randomMeal.id }).then(res => res[0])
    const section = (meal.sectionId && await ctx.database.get('section', { id: meal.sectionId }).then(res => res[0])) || undefined

    return {
      ...meal,
      section
    }
  }

  async function randomCourse (disabledFlags: Flags[] = ['nsfw', 'disabled']) {
    const courses = await ctx.database.get('course', {})

    const filteredCourses = courses.filter((item) => item.flags.every(flag => !disabledFlags.includes(flag)))

    if (!filteredCourses.length) return null

    const randomCourse = random(filteredCourses)

    const items = await ctx.database.get('course-item', {
      courseId: randomCourse.id
    })
    const meals = await Promise.all(items.map(item => ctx.database.get('meal', {
      id: item.mealId
    })))
    return {
      ...randomCourse,
      compositions: items.map((item, index) => ({
        ...item,
        meal: meals[index]
      }))
    }
  }

  return {
    randomMeal,
    randomCourse
  }
}
