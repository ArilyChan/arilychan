const path = require('path')
const appDir = path.dirname(require.main.filename)

const config = require(`${appDir}/config`)
const app = require('sb-qq-bot-framework/lib/Bot')(config.koishi)

const init = require('./init')
init(app)
  .then(() => app.start())
