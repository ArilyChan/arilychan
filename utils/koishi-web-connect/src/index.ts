import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction, Handler } from 'express'
import type { App } from 'koishi'

// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'

export type ConnectableResuest = IncomingMessage & { originalUrl?: string };
export type Config = {
  waitForServer?: boolean
}

function checkHttpServer (app: App) {
  if (!app?._httpServer) throw new Error('web server does not exists. Please check your configuration.')
}

// const doNothing = () => {}
export function asExpressMiddleware (app: App, { waitForServer }: Config = { waitForServer: false }): Handler {
  // app.once('ready', doNothing)
  const logger = app?.logger('web-connect')?.extend('express-middleware') || { ...console, debug: (...args) => console.log('debug:', ...args) }
  let serverOk = false
  if (waitForServer && !app?.isActive) {
    serverOk = false
    app.once('ready', () => {
      checkHttpServer(app)
      serverOk = true
    })
  } else {
    checkHttpServer(app)
    serverOk = true
  }

  return (req: ConnectableResuest, res: ServerResponse, next: NextFunction) => {
    const exactUrl = req.originalUrl || req.url
    const matchingUrl = parse(exactUrl as string).pathname || ''
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
