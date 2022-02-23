// const admins = require('../admins')
// const path = require('path')
// const appDir = path.dirname(require.main.filename)
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder(app => app, 'bocai'),
    use: [
      {
        type: 'node_module',
        require: 'koishi-plugin-express',
        bypassLoader: true,
        options: {
          koishiRoutes: 'use',
          port: 8080
        }
      },
      {
        module: {
          name: 'really works?',
          apply: (app) => {
            app.router.all('/test', ({ request, response }, next) => {
              response.body = 'hi'
            })
            app.using(['express'], function ExpressTester (ctx) {
              console.log('express installed')
              ctx.express.get('/express', (req, res, next) => {
                res.send('express')
              })
            })
          }
        },
        bypassLoader: true
      }
    ]
  }
]
