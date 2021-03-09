const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder((app) => app, 'any'),
    use: [
      {
        type: 'node_module',
        require: 'koishi-plugin-common',
        priority: 1,
      }
    ]
  }
]
