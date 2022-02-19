const Loader = require('./Loader')

class InstallContextPlugin {
  constructor (config) {
    this.config = config
    this.webApps = []
  }

  async apply (app) {
    await Promise.all(this.config.map(async ctx => {
      let loader
      if (ctx.use instanceof Loader) {
        loader = ctx.use
      } else {
        loader = new Loader(ctx.use)
      }
      console.info('install plugins for:', ctx.for.description)
      await loader.installToContext(ctx.for.getContextFromCtx(app))
      this.webApps.push(...loader.webApps)
    }))
    return this
  }

  async build () {
    for (const conf of this.config) {
      let loader
      if (conf.use instanceof Loader) {
        loader = conf.use
      } else {
        loader = new Loader(conf.use)
      }
      const buildFunctions = loader.getBuildFunctions()
      for (const pluginBuildFunction of buildFunctions) {
        await pluginBuildFunction()
      }
    }
  }
}

// module.exports = async (app, config) => {
//   const Applier = new ApplyContextPlugin(config)
//   await Applier.apply(app)
//   return Applier
// }
module.exports = InstallContextPlugin
