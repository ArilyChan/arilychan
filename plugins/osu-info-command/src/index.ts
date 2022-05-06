import { Context, Schema } from 'koishi'
import * as database from './database'
import * as screenshot from './screenshot'
import * as text from './text'
const serverConfig = Schema.object({
  default: Schema.boolean().default(false).description('默认查询此服务器'),
  // trigger: Schema.array(String).description('触发').default([]),
  server: Schema.string(),
  mode: Schema.array(String).default(['osu', 'taiko', 'fruit', 'mania'])
})
export interface Options {
  screenshot: {
    base: string,
  }
  server: Record<string, {
    default: boolean,
    // trigger: string[],
    server: string,
    mode: string[]
  }>,
  modeAlias: Record<string, string[]>
}
export const schema = Schema.object({
  screenshot: Schema.object({
    base: Schema.string().default('https://info.osustuff.ri.mk/cn').description('osu-info-web网站根目录(/{lang})')
  }),
  server: Schema.dict(serverConfig)
    .description('配置可用的服务器')
    .default({
      bancho: {
        default: true,
        // trigger: ['!!', '?'],
        server: 'osu! 官方服务器',
        mode: ['osu', 'taiko', 'fruit', 'mania']
      },
      sb: {
        default: false,
        // trigger: ['*'],
        server: 'ppy.sb私服',
        mode: ['osu', 'osuRX', 'osuAP', 'taiko', 'taikoRX', 'fruit', 'fruitRX', 'mania']
      }
    }),
  modeAlias: Schema.dict(Schema.array(String))
    .description('mode的别名')
    .default({
      osu: ['std'],
      osuRX: ['rx', 'stdrx', 'osurx', 'relax', 'osurelax'],
      osuAP: ['ap', 'stdap', 'osuap', 'ap', 'osuautopilot'],
      taiko: ['太鼓', 'Taiko'],
      taikoRX: ['taikorx'],
      fruit: ['ctb', '接水果'],
      mania: ['骂娘', 'keys', 'key']
    })
})
export const name = 'osu-info-command'
export function apply (ctx: Context, options: Options) {
  console.log(options)
  ctx.plugin(database, options)
  // @ts-expect-error we got this, it's fine
  ctx.plugin(screenshot, options)
  ctx.plugin(text, options)
}

/*

数据库：
user.osu = {
  bancho: {
    mode: osu
  },
  sb: {
    mode: osuRX
  }
}
默认配置：看最上面
{
  screenshot: { base: 'https://info.osustuff.ri.mk/cn' },
  server: {
    bancho: { default: true, server: 'osu! 官方服务器', mode: [Array] },
    sb: { default: false, server: 'ppy.sb私服', mode: [Array] }
  },
  modeAlias: {
    osu: [ 'std' ],
    osuRX: [ 'rx', 'stdrx', 'osurx', 'relax', 'osurelax' ],
    osuAP: [ 'ap', 'stdap', 'osuap', 'ap', 'osuautopilot' ],
    taiko: [ '太鼓', 'Taiko' ],
    taikoRX: [ 'taikorx' ],
    fruit: [ 'ctb', '接水果' ],
    mania: [ '骂娘', 'keys', 'key' ]
  }
}
*/
