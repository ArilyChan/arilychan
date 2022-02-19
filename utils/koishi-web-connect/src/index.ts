import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction } from 'express'
import type { App } from 'koishi'

// eslint-disable-next-line node/no-deprecated-api
import { parse } from 'url'

export type ConnectableResuest = IncomingMessage & { originalUrl?: string };
export type Config = {
  waitForServer?: boolean
}

// const doNothing = () => {}
export function asExpressMiddleware (app: App, { waitForServer }: Config = { waitForServer: false }) {
  // app.once('ready', doNothing)
  let wait = Promise.resolve(42)
  if (waitForServer) {
    if (!app?.isActive && app?._httpServer) {
      wait = new Promise<number>((resolve) => {
        app.once('ready', () => resolve(42))
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
      return wait.then(() => next())
    }
    req.url = exactUrl
    return app?._httpServer?.emit('request', req, res)
  }
}
