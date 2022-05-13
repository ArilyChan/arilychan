import { Context } from 'koishi'
import '@koishijs/plugin-console'
import { resolve } from 'path'
export const name = 'console-toolkits'

export function apply (ctx: Context) {
  // 在已有插件逻辑的基础上，添加下面这段
  ctx.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist')
    })
  })
  ctx.plugin(resolve(__dirname, './assignee/server'))
}
