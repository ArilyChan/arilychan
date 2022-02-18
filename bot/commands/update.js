require('dotenv').config()
const path = require('path')
const appDir = path.dirname(require.main.filename)

const config = require(`${appDir}/../config`)
const app = require('sb-qq-bot-framework/lib/Bot')(config.koishi)

app.plugin('koishi-plugin-ci', {
  update: {
    channel: 'stable'
  }
})
const init = require('../init')
init(app)
  .then(() => app.ci.update.update())
  .then((result) => result && console.table(result, ['plugin', 'old', 'current', 'successed', 'error']))
  .then(() => process.exit(0))
