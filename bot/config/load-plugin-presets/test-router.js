// const admins = require('../admins')
// const path = require('path')
// const appDir = path.dirname(require.main.filename)
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder(app => app, 'bocai'),
    use: [
      {
        module: {
          name: 'really works?',
          apply: (app) => {
            app.router.all('/test', ({ request, response }, next) => {
              response.body = 'hi'
            })
          }
        }
      }
    ]
  }
]
