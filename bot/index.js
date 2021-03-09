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

// ;(async () => {
//   let count = 0
//   const maxTries = 3
//   try {
//     while (count++ <= maxTries) {
//       try {
//         await app.start()
//       } catch (e) {
//         console.log('⚠️Uncatched Exception!!')
//         console.log(e.stack)
//         if (count >= maxTries) throw e
//       }
//     }
//   } catch (e) {
//     console.log('Max retries exceed. Quit now.')
//     console.log(e)
//   }
// })()

app.start()

// setTimeout(() => Promise.resolve().then(() => {
//   throw new Error('reject!')
// }), 5000)
// process.on('unhandledRejection', async (error) => {
//   try {
//     const bot = app.bots.find(bot => bot)
//     if (!bot) return
//     await bot.sendPrivateMsg(879724291, `${error.stack}`)
//   } catch (err) {
//     console.log(error)
//   }
// })
