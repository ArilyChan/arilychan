require('dotenv').config()
const path = require('path')
const appDir = path.dirname(require.main.filename)
const { express, http } = require('sb-qq-bot-framework/lib/WebServer')

const config = require(`${appDir}/config`)
console.log(config)
const app = require('sb-qq-bot-framework/lib/Bot')(config.koishi)

const pluginLoader = require('sb-qq-bot-framework/lib/ContextPluginApply')
pluginLoader(app, config.contextPlugins)
  .then(Loaded => {
    Loaded.webViews.map(async v => {
      const middleware = await v.expressApp(v.options, await v.pluginData, http)
      if (!middleware) return
      console.log(v.name, 'installed on', v.path)
      express.use(v.path, middleware)
    })
    const port = process.env.PORT || 3005
    http.listen(port, () => console.log(`Bot web app listening on port ${port}!`))
  })
  .catch(error => console.log(error))

app.start()
