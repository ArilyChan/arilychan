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
        require: 'koishi-plugin-ci'
      },
      {
        module: {
          name: 'use',
          apply (ctx) {
            ctx.using(['ci'], async ({ ci }) => {
              ci.useBuild(() => {
                console.log('build')
              })
            })
          }
        }
      }
    ]
  }
]
