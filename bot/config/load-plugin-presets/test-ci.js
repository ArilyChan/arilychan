// const admins = require('../admins')
// const path = require('path')
// const appDir = path.dirname(require.main.filename)
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder(app => app, 'bocai'),
    use: [
      {
        bypassLoader: true,
        module: {
          name: 'use-ci',
          apply (ctx) {
            ctx.using(['ci'], async ({ ci }) => {
              ci.build.use(async () => {
                console.log('build')
                return {
                  job: 'test-build',
                  success: true
                }
              })
              ci.update.use({
                async check (updateOptions) {
                  return {
                    current: 0,
                    latest: 1,
                    hasUpdate: true
                  }
                },
                async update (updateOptions) {
                  return {
                    before: 0,
                    current: 1,
                    successed: true
                  }
                }
              })
            })
          }
        }
      }
    ]
  }
]
