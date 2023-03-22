// const manual = require('sb-bot-manual')
import api from './server/api'
import server from './server/express'
import { Context, Schema } from 'koishi'
import * as Command from './command'

export const name = 'arilychan-radio'
export const schema = Schema.object({
  // duration: Schema.number().usage('')
  expire: Schema.number().description('点歌有效期限（天）').default(7),
  // db: Schema.object({
  //   uri: Schema.string().description('mongodb connect uri')
  // }).description('currently running on custom server'),
  web: Schema.object({
    path: Schema.string().description('网页地址，运行在express上。需要websocket服务。').default('/radio'),
    host: Schema.string().description('domain?').default('https://bot.ri.mk')
  })
})
export type Config = {
  expire: number,
  web: {
    path: string,
    host: string
  }
}
export const apply = async (ctx: Context, options: Config) => {
  const storage = await api(ctx, options)
  // @ts-expect-error
  ctx.using(['express'], function arilychanRadioWebService ({ express, _expressHttpServer }) {
    express.use(options.web.path, server(options, storage, _expressHttpServer))
  })
  ctx.plugin(Command, options)
}