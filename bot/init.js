const { express, http } = require('sb-qq-bot-framework/lib/WebServer')

module.exports = async (app) => {
  const config = require('./config')

  const InstallContextPlugin = require('sb-qq-bot-framework/lib/InstallContextPlugin')
  const Installer = new InstallContextPlugin(config.contextPlugins)
  await Installer.apply(app)
    .then(LoadedPlugins => {
      LoadedPlugins.webApps?.map(async v => {
        const middleware = await v.expressApp(v.options, await v.pluginData, http)
        if (!middleware) return
        console.log(v.name, 'installed on', v.path)
        express.use(v.path, middleware)
      })
      const port = process.env.PORT || 3005
      http.listen(port, () => console.log(`Bot web app listening on port ${port}!`))
    })
    .catch(error => console.log(error))
}
