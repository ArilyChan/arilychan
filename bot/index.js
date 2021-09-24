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
      const middleware = v.expressApp(v.options, await v.pluginData, http)
      if (!middleware) return
      console.log(v.name, 'installed on', v.path)
      express.use(v.path, middleware)
    })
    const port = process.env.PORT || 3005
    http.listen(port, () => console.log(`Bot web app listening on port ${port}!`))
  })
  .catch(error => console.log(error))

app.middleware(async (session, next) => {
  if (!session?.content?.startsWith('~s')) return next()
  const url = session.content.slice(2).trim()
  try {
    const screen = await app.puppeteerCluster.screenshot.base64(url && new URL(url).toString() || 'https://google.com')
    session.send(`[CQ:image,file=base64://${screen}]`)
  } catch (error) {
    session.send(error.stack)
  }
})
app.middleware(async (session, next) => {
  if (!session?.content?.startsWith('~t')) return next()
  const url = session.content.slice(2).trim()
  try {
    const screen = await app.puppeteerCluster.instance.execute({url: url && new URL(url).toString() || 'https://google.com'})
    session.send(`[CQ:image,file=base64://${screen}]`)
  } catch (error) {
    session.send(error.stack)
  }
})
app.middleware(async (session, next) => {
  if (!session?.content?.startsWith('~c')) return next()
  const url = session.content.slice(2).trim()
  try {
    const screen = await app.puppeteerCluster.screenshot.save(url && new URL(url).toString() || 'https://google.com', './test.png')
    session.send('saved')
  } catch (error) {
    session.send(error.stack)
  }
})

app.start()
