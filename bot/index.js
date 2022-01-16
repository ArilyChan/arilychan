require('dotenv').config()
const path = require('path')
const appDir = path.dirname(require.main.filename)
const { express, http } = require('sb-qq-bot-framework/lib/WebServer')

const config = require(`${appDir}/config`)
const app = require('sb-qq-bot-framework/lib/Bot')(config.koishi)

const adapters = [require('./install-adapters/onebot')]
adapters.map(cb => cb(app))

const ApplyContextPlugin = require('sb-qq-bot-framework/lib/ApplyContextPlugin')
;(async () => {
  const Installer = new ApplyContextPlugin(config.contextPlugins)
  return await Installer.apply(app)
})()
  .then(LoadedPlugins => {
    LoadedPlugins.webApps.map(async v => {
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
