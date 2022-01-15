const Loader = require('./Loader')

class ApplyContextPlugin {
  constructor (config, options) {
    this.config = config
    this.options = options
    this.webApps = []
  }

  apply (app) {
    return Promise.all(this.config.map(async ctx => {
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
  }
}

module.exports = async (app, config) => {
  const Applier = new ApplyContextPlugin(config)
  await Applier.apply(app)
  return Applier
}
