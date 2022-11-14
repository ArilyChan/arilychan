import { Context } from 'koishi'
import { Config } from '..'
import useRandomCourse from './useRandomCourse'
import useRandomMeal from './useRandomMeal'

export default (ctx: Context, options: Config) => {
  return {
    randomMeal: useRandomMeal(ctx, options),
    randomCourse: useRandomCourse(ctx, options)
  }
}
