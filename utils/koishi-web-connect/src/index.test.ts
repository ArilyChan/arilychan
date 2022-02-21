import { createServer } from 'http'
import express from 'express'
import { App, Context } from 'koishi'
import request from 'supertest'
import { asExpressMiddleware } from '.'

let port = 12345
const acc = (waitForServer) => {
  // create koishi instance
  const app = new App({
    port: ++port
  })
  // install test plugin
  app.plugin({
    name: 'koa web app',
    apply (ctx: Context) {
      ctx.router.get('/koa', ({ request, response }) => {
        response.body = 'yes'
      })
    }
  })
  // start koishi
  app.start()

  // create express server
  const expressApp = express()
  expressApp.use(asExpressMiddleware(app, { waitForServer }))
  expressApp.use('/express', (req: express.Request, res: express.Response) => {
    res.send('express')
  })

  // create http server
  const http = createServer(expressApp)
  http.listen(++port)

  it('koa app should be accessable from created http server', async () => {
    const res = await request(http).get('/koa')
    expect(res.text).toEqual('yes')
  })

  it('express app should be accessable from created http server', async () => {
    const res = await request(http).get('/express')
    expect(res.text).toEqual('express')
  })

  afterAll(() => {
    http.close()
    app.stop()
  })
}

describe('accessibility (waitForServer: true)', () => {
  acc(true)
})

describe('accessibility (waitForServer: false)', () => {
  acc(false)
})
describe('edge case handling', () => {
  // create koishi instance
  const app = new App({
    port: ++port
  })
  // create express server
  const expressApp = express()

  // create http server
  const http = createServer(expressApp)
  http.listen(++port)

  const app2 = Object.create(app)
  app2._httpServer = null

  it('should fail if waitForServer is false and koishi not started', () => {
    expect(app.isActive).toEqual(false)
    expect(() => asExpressMiddleware(app2, { waitForServer: false })).toThrow(Error)
  })

  it('should wait for koishi start if wait for server is set to true', async () => {
    expect(app.isActive).toEqual(false)
    app.plugin((ctx) => ctx.router.get('/koa', ({ response }) => { response.body = 'koa' }))
    expressApp.use(asExpressMiddleware(app2, { waitForServer: true }))
    app2._httpServer = app._httpServer
    await app.start()
    const res = await request(http).get('/koa')
    expect(res.text).toEqual('koa')
  })

  afterAll(() => {
    http.close()
  })
})
