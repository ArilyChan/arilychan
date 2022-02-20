import { App, Context } from 'koishi'
import request from 'supertest'
import * as expressService from './index'

declare module 'supertest' {
  // eslint-disable-next-line no-unused-vars
  interface Test {
    get(url): {
      text(): string
    }
  }
}

let _port = 12345
const port = () => ++_port

describe('install plugin (not handling defalut router)', () => {
  const app = new App({
    port: port()
  })

  app.plugin(expressService)
  app.plugin({
    name: 'koa router user',
    apply (ctx) {
      ctx.app.router.use('/koa', ({ response }) => {
        response.body = 'koa'
      })
    }
  })

  app.plugin({
    name: 'express router user',
    apply (ctx: Context) {
      ctx.using(['express'], (ctx) => {
        ctx.express.get('/express', (req, res) => {
          res.send('express')
        })
      })
    }
  })

  it('should handle express routes', () => {
    const res = request(app._expressHttpServer)
      .get('/express')
    expect(res.text).toEqual('express')
  })
})
