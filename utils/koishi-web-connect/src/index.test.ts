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

describe('wait for server init', () => {
  // create koishi instance
  const app = new App({
    port: ++port
  })
  // create express server
  const expressApp = express()

  // create http server
  const http = createServer(expressApp)
  http.listen(++port)

  it('should fail if waitForServer is false and koishi not started', async () => {
    expect(app.isActive).toEqual(false)
    if (!app._httpServer) {
      expect(asExpressMiddleware(app, { waitForServer: false })).toThrow('Error')
    }
  })
  afterAll(() => {
    http.close()
  })
})
