# koishi-web-connect

connect web backends for koishi

usage
```javascript
const { asExpressMiddleware } = require('koishi-web-connect')

const { App } = require('koishi')
const koishiApp = new App({
    port: 12344
})
// a plugin that handles web requests
koishiApp.plugin((ctx) => ctx.router.get('/koa' ({response}) => response.body = 'koa'))

const express = require('express')
const expressApp = express()
expressApp.use(asExpressMiddleware(koishiApp))
const customServer = require('http').createServer(expressApp)
customServer.listen(12345)
```
if everything goes well then you should have koishi routes available in your custom server!
```javascript
fetch('http://localhost:12345/koa')
  .then(res => res.text())
  .then(text => assert.strictEqual(text, 'koa'))
```