import type { Flags } from '../declares'
import { Context } from 'koishi'
import { Config } from '..'

const random = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

export default (ctx: Context, options: Config) => {
  async function randomMeal (disabledFlags: Flags[] = ['nsfw', 'disabled'], section?: string | number) {
    const _int = parseInt(section as string)
    const or = [
      !isNaN(_int) && {
        id: _int
      },
      {
        name: section?.toString()
      }
    ].filter(Boolean) as Array<{id: number} | {name: string}>

    const selectedSection = (section && await ctx.database.get('section', {
      $or: or
    }, { limit: 1 }).then(res => res[0])) || false

    const meals = await ctx.database.get('meal', {
      sectionId: (selectedSection && selectedSection.id as number) || undefined
    }, ['id', 'flags'])

    const filtered = meals.filter((item) => item.flags.every(flag => !disabledFlags.includes(flag)))

    if (!meals.length) return null

    const randomMeal = random(filtered)

    const meal = await ctx.database.get('meal', { id: randomMeal.id }).then(res => res[0])

    const assets = await ctx.database.get('meal-asset', {
      id: {
        $in: meal.assets.map(parseInt)
      }
    })

    const _section = selectedSection || (meal.sectionId && await ctx.database.get('section', { id: meal.sectionId }).then(res => res[0])) || undefined

    return {
      ...meal,
      assets: meal.assets.map(aid => assets.find(a => aid === a.id.toString())),
      section: _section
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

  return {
    randomMeal,
    randomCourse
  }
}
