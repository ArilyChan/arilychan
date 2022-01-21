const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder(app => app, 'bocai'),
    use: [
      {
        type: 'node_module',
        require: 'koishi-plugin-blame',
        options: {
          send: {
            private: ['onebot:879724291']
          }
        }
      },
      {
        module: {
          apply (ctx) {
            ctx.middleware(session => {
              Promise.reject(new Error('unhandled'))
            })
          }
        }
      }
    ]
  }
]
