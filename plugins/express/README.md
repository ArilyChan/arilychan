# koishi-plugin-express

express server for koishi

```javascript
// use plugin
koishiApp.plugin('koishi-plugin-express', {
    koishiRoutes: 'ignore' | 'use',
    port: Number | undefined
    hostname: String | undefined
})
```
|koishiRoutes|behavior|
|--|--|
|ignore| will not pass requests to koa server|
|use| koa routes will be accessable from express server|
||default: ignore|

|options|description|
|--|--|
|port|will spin up http server when provided|
|hostname|will be passed to http.createServer(port, hostname)|

```javascript
// using express
app.plugin({
    using: ['express'],
    apply({ express }) {
        express.get('/express', (req) => {
            req.send('express')
        })
    }
})
```