
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder((app) => app.group(559633343, 926872640), 'bocai'),
    use: [
      {
        type: 'node_module',
        require: 'blackfarts',
        priority: 1
      }
    ]
  }
]
