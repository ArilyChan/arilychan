import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction, Handler } from 'express'
import type { App } from 'koishi'

import { URL } from 'url'

export type ConnectableResuest = IncomingMessage & { originalUrl?: string };
export type Config = {
  waitForServer?: boolean
}
type Root = App & { _httpServer: any, isActive: boolean }
function checkHttpServer (app: Root) {
  if (!app?._httpServer) throw new Error('web server does not exists. Please check your configuration.')
}

export function asExpressMiddleware (app: Root, { waitForServer }: Config = { waitForServer: false }): Handler {
  const logger = app?.logger('web-connect')?.extend('express-middleware') || { ...console, debug: (...args) => console.log('debug:', ...args) }
  let serverOk = false
  if (waitForServer && !app?.isActive) {
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

  return (req: ConnectableResuest, res: ServerResponse, next: NextFunction) => {
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
    app?._httpServer?.emit('request', req, res)
  }
}
