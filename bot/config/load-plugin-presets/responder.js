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
            app.middleware((session, next) => {
              console.log(session.send(123))
            })
          }
        }
        // type: 'node_module',
        // require: 'koishi-plugin-puppeteer-cluster'
      }
    ]
  }
]
