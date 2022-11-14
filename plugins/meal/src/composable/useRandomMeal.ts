import type { Flags } from '../declares'
import { Context } from 'koishi'
import { Config } from '..'
import { random } from './useUtils'

const createScope = (ctx: Context, options: Config) => async (disabledFlags: Flags[] = ['nsfw', 'disabled'], section?: string | number) => {
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

export default createScope
export type Return = ReturnType<ReturnType<typeof createScope>>
