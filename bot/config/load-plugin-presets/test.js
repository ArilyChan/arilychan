// const admins = require('../admins')
const path = require('path')
const appDir = path.dirname(require.main.filename)
const ContextBuilder = require('sb-qq-bot-framework/lib/contextBuilder')

module.exports = [
  {
    for: ContextBuilder(app => app, 'bocai'),
    use: [
      {
        type: 'node_module',
        require: 'koishi-plugin-osuercalendar',
        options: {
          users: {
            admin: [], // 管理员自行添加
            blackList: [],
            whiteList: []
          },
          eventFile: path.join(appDir, 'Plugins/exsper/osuerCalendar/osuercalendar-events.json') // __dirname为config文件夹
        }
      },
      {
        type: 'node_module',
        require: 'koishi-plugin-puppeteer-cluster'
      }
    ]
  }
]
