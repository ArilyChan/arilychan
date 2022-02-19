import { App } from 'koishi'
import * as express from 'express'

export default function connect (app: App) {
  if (!app?._httpServer) throw new Error('web server not exists. Please check your configuration')

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const baseUrl = req.baseUrl || req.url
    const exactUrl = req.originalUrl || baseUrl
    const match = app.router.match(baseUrl, req.method)
    if (!match.route) {
      return next()
    }
    req.url = exactUrl
    return app?._httpServer?.emit('request', req, res)
  }
}