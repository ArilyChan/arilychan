// require('dotenv').config()
// const path = require('path')
// const appDir = path.dirname(require.main.filename)

// const config = require(`${appDir}/config`)

// const InstallContextPlugin = require('sb-qq-bot-framework/lib/InstallContextPlugin')
// ;(async () => {
//   const Installer = new InstallContextPlugin(config.contextPlugins)
//   await Installer.build()
//   console.log('build complete')
//   process.exit(0)
// })()

const app = require('./init');
(async () => {
  try {
    await app.build()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
// app.ci?.build()
//   .then(() => process.exit(0))
