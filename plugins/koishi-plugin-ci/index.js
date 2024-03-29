const { Service, Context, Modules, Schema } = require('koishi')
const Build = require('./Build')

Context.service('ci')
module.exports = class KoishiCI extends Service {
  constructor (ctx, options = {}) {
    super(ctx, 'ci', true)
    this.build = new Build(this)
    this.options = options
  }

  getPluginState (plugin) {
    if (!plugin) {
      const state = this[Context.current].state
      // this._addStateRef(state)
      return state
    }
    plugin = typeof plugin === 'string' ? Modules.require(plugin, true) : plugin
    const result = this.ctx.app.registry.get(plugin)
    if (!result) return result
    return result
  }

  getStateRoot (state, ttl = 64) {
    let root = state
    while (ttl && state.parent && state.parent.id !== '') {
      ttl -= 1
      root = state.parent
    }
    return root
  }
}

module.exports.schema = Schema.object({})
