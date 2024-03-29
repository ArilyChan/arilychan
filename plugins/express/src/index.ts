import { createServer, Server } from 'http'
import express from 'express'
import { Context, App, Schema } from 'koishi'
import { asExpressMiddleware } from 'koishi-web-connect'

declare module 'koishi' {
  export interface Context {
    express: express.Application
    _expressHttpServer: Server
  }
}

Context.service('express')
Context.service('_expressHttpServer')

export const name = 'express'
export type fourtyTwo = 42
export interface Options {
  koishiRoutes: 'use' | 'ignore',
  port: number,
  hostname: string | undefined
}
export const schema = Schema.object({
  koishiRoutes: Schema.union([
    Schema.const('use').description('passthrough unhandled requests to koishi\'s web server'),
    Schema.const('ignore').description('server will handle requests to express only')
  ]).description('controls how express middleware handles requests.').default('ignore'),
  port: Schema.number().description('an http server will be created when provided a number'),
  hostname: Schema.string().description('listen to specific hostname')
})

export function apply (ctx: Context, options: Options = {
  koishiRoutes: 'ignore',
  port: 0,
  hostname: undefined
}): void {
  if (!ctx.root) return

  const expressApp = express()
  ctx.express = expressApp

  ctx._expressHttpServer = createServer(expressApp)

  if (options.port) ctx._expressHttpServer.listen(options.port, options.hostname, () => ctx.logger('express').info('express server listening at', options.hostname, ':', options.port))
  if (options.koishiRoutes === 'use') {
    expressApp.use(asExpressMiddleware(ctx.root as App, { waitForServer: true }))
  } else if (options.koishiRoutes !== 'ignore') throw new Error('unsupported koishi route handling method: ' + options.koishiRoutes)
}
