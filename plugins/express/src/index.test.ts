import { App, Context } from 'koishi'
import request from 'supertest'
import * as express from './index'

declare module 'supertest' {
  // eslint-disable-next-line no-unused-vars
  interface Test {
    get(url): {
      text: string,
      statusCode: number
    }
  }
}

let _port = 12345
const port = () => ++_port

describe('install plugin (not handling defalut router)', () => {
  const app = new App({
    port: port()
  })

  app.plugin(express)
  app.plugin({
    name: 'koa router user',
    apply (ctx) {
      ctx.app.router.all('/koa', ({ response }) => {
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

  it('should handle express routes', async () => {
    const res = await request(app._expressHttpServer)
      .get('/express')
    expect(res.text).toEqual('express')
  })

  it('should not handle koa routes', async () => {
    const res = await request(app._expressHttpServer)
      .get('/koa')
    expect(res.statusCode).toEqual(404)
  })
})

describe('use koishi routes', () => {
  const app = new App({
    port: port()
  })

  app.plugin(express, {
    koishiRoutes: 'use',
    port: port()
  })
  app.plugin({
    name: 'koa router user',
    apply (ctx) {
      ctx.app.router.all('/koa', ({ response }) => {
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

  it('should handle express routes', async () => {
    const res = await request(app._expressHttpServer)
      .get('/express')
    expect(res.text).toEqual('express')
  })

  it('should handle koa routes', async () => {
    const res = await request(app._expressHttpServer)
      .get('/koa')
    expect(res.text).toEqual('koa')
  })
  afterAll(() => {
    app._expressHttpServer.close()
  })
})

describe('error handling', () => {
  it('should do nothing when ctx.app is falsy', () => {
    expect(express.apply({} as Context)).toBeUndefined()
  })
  it('should throws error on unsupported koishiRoutes', () => {
    expect(() => express.apply({
      app: {}
    } as Context, {
      koishiRoutes: 'what?'
    } as any)).toThrow(Error)
  })
})
