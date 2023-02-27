import { createServer } from 'http'
import express from 'express'
import { App } from 'koishi'
import request from 'supertest'
import { asExpressMiddleware } from '.'

let port = 12345
const acc = async (waitForServer: boolean) => {
  // create koishi instance
  const app = new App({
    port: ++port
  })
  // install test plugin
  app.plugin({
    name: 'koa web app',
    apply (ctx) {
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
  expressApp.use('/express', (req, res) => {
    res.end('express')
  })

  // create http server
  const httpServer = createServer(expressApp)
  httpServer.listen(++port)

  it('koa app should be accessible from created http server', async () => {
    const res = await request(httpServer).get('/koa')
    expect(res.text).toEqual('yes')
  })

  it('express app should be accessible from created http server', async () => {
    const res = await request(httpServer).get('/express')
    expect(res.text).toEqual('express')
  })

  afterAll(() => {
    app.stop()
    httpServer.close()
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

  it('should wait for koishi to start if waitForServer is set to true', async () => {
    expect(app.events.isActive).toEqual(false)
    app.plugin((ctx) => ctx.router.get('/koa', ({ response }) => { response.body = 'koa' }))
    expressApp.use(asExpressMiddleware(app, { waitForServer: true }))
    app.start()
    const res = await request(http).get('/koa')
    expect(res.text).toEqual('koa')
  })

  afterAll(() => {
    http.close()
  })
})
