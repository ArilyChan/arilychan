
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder((app) => app, 'test-group'),
    use: [
      {
        type: 'node_module',
        require: 'sb-plugin-osu-stat-screenshot',
        priority: 1
      }
    ]
  }
]
