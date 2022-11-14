import { Context, Schema } from 'koishi'
import { idType } from './declares'

export const name = 'meal'

export interface Config {}

export const schema: Schema<Config> = Schema.object({})

export function apply (ctx: Context, options: Config) {
  ctx.model.extend('meal', {
    id: idType,
    name: 'string',
    assets: 'list',
    description: 'list',
    'source.user': 'char',
    'source.channel': 'char',
    'source.platform': 'char',
    flags: 'list',
    sectionId: idType
  }, {
    foreign: {
      sectionId: ['section', 'id']
      // source: {
      //   user: ['user', 'id']
      // },
      // 'source.user': ['user', 'id']
    }
  })
  ctx.model.extend('section', {
    id: idType,
    name: 'string',
    assets: 'list',
    description: 'list',
    flags: 'list'
  })
  ctx.model.extend('course', {
    id: idType,
    name: 'string',
    flags: 'list'
  })
  ctx.model.extend('meal-asset', {
    id: idType,
    file: 'string',
    base64: 'string'
  })
  ctx.model.extend('course-item', {
    id: idType,
    courseId: idType,
    type: 'char',
    mealId: idType
  }, {
    foreign: {
      courseId: ['course', 'id'],
      mealId: ['meal', 'id']
    }
  })
}
