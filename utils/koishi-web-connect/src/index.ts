import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction, Handler } from 'express'
import type { Context } from 'koishi'

export type ConnectableRequest = IncomingMessage & { originalUrl?: string };
export type Config = {
  waitForServer?: boolean
}
function checkHttpServer (app: Context) {
  if (!app.router._http) throw new Error('web server does not exists. Please check your configuration.')
}

export function asExpressMiddleware (app: Context, { waitForServer }: Config = { waitForServer: false }): Handler {
  const logger = app.logger('web-connect').extend('express-middleware')
  let serverOk = false
  if (waitForServer && !app.events.isActive) {
    serverOk = false
    app.once('ready', () => {
      checkHttpServer(app)
      serverOk = true
      logger.info('express server ready')
    })
  } else {
    checkHttpServer(app)
    serverOk = true
  }

  return (req: ConnectableRequest, res: ServerResponse, next: NextFunction) => {
    const exactUrl = req.originalUrl || req.url
    const matchingUrl = new URL(exactUrl as string).pathname || ''
    const match = app.router.match(matchingUrl, req.method as string)

    if (!match.route) {
      logger.debug('got no matching routes, pass to express')
      if (!serverOk) return next(new Error('koa server not ready yet, waitForServer is set to true'))
      return next()
    }
    logger.debug('got matching routes, pass to koa')
    req.url = exactUrl
    app.router._http?.emit('request', req, res)
  }
}
