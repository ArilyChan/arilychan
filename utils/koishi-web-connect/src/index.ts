import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction, Handler } from 'express'
import type { App } from 'koishi'

// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'

export type ConnectableResuest = IncomingMessage & { originalUrl?: string };
export type Config = {
  waitForServer?: boolean
}

// const doNothing = () => {}
export function asExpressMiddleware (app: App, { waitForServer }: Config = { waitForServer: false }): Handler {
  // app.once('ready', doNothing)
  const logger = app.logger('web-connect').extend('express-middleware')
  let wait: Promise<any> = Promise.resolve(42)
  if (waitForServer && !app._httpServer) {
    if (!app?.isActive) {
      wait = new Promise<any>((resolve) => {
        app.once('ready', () => {
          resolve(42)
        })
      })
    }
  } else {
    if (!app?._httpServer) throw new Error('web server does not exists. Please check your configuration.')
  }

  return (req: ConnectableResuest, res: ServerResponse, next: NextFunction) => {
    const exactUrl = req.originalUrl || req.url
    const matchingUrl = parse(exactUrl as string).pathname || ''
    const match = app.router.match(matchingUrl, req.method as string)

    if (!match.route) {
      logger.debug('got matching routes, pass to express')
      return wait.then(() => next())
    }
    logger.debug('got matching routes, pass to koa')
    req.url = exactUrl
    app?._httpServer?.emit('request', req, res)
    return undefined
  }
}
