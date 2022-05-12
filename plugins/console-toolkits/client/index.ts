import { Context } from '@koishijs/client'
import Page from './base.vue'
// import { relative } from 'path'

import tools from './register/tools'
const regComponent = (entry) => {
  // const { component, keyword } = entry
  tools.value.push(entry)
}

export default async (ctx: Context) => {
  await Promise.all([
    // ['../toolkits/test-util.vue', { name: '测试' }],
    ['../toolkits/assignee/client.vue']
  ].map(async ([cpath, mixin]: [string, any]) => {
    // const component = await import(/* @vite-ignore */relative(__dirname, cpath))
    const module = await import(/* @vite-ignore */cpath)
    const component = module.default
    mixin = {
      ...module,
      default: undefined,
      ...mixin
    }
    if (!component) return
    console.log(component)
    const entry = {
      ...typeof mixin === 'object' && mixin,
      keywords: [...component.keywords || [], ...mixin?.keywords || [], component.name, mixin?.name],
      component
    }
    regComponent(entry)
  }))
  // 此 Context 非彼 Context
  // 我们只是在前端同样实现了一套插件逻辑
  ctx.addPage({
    name: 'toolkits',
    path: '/toolkits',
    component: Page
  })
}
