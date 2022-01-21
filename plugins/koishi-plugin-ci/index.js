const { Service, Context, Modules } = require('koishi')
Context.service('ci')

module.exports = class KoishiCI extends Service {
  constructor (ctx) {
    super(ctx, 'ci', true)
    this.builder = new Map()
  }

  getState (plugin) {
    if (!plugin) return this[Context.current].state
    plugin = typeof plugin === 'string' ? Modules.require(entry, true) : plugin
    return this.ctx.app.registry.get(plugin)
  }

  getStateRoot (state, ttl = 64) {
    let root = state
    while (ttl && state.parent && state.parent.id !== '') {
      ttl -= 1
      root = state.parent
    }
    return root
  }

  useBuild (buildFunc) {
    const id = this.getStateRoot(this.getState()).id
    // const id = this.getState().id
    if (!this.builder.has(id)) this.builder.set(id, [])
    const current = this.builder.get(id)
    current.push(buildFunc)
  }

  async build ({ only, except } = {}) {
    let builder
    if (only) {
      only = only.map(plugin => this.getState(plugin).id)
      console.log(only, this.builder)
      builder = new Map([...this.builder.entries()].filter(([id]) => only.includes(id)))
    } else if (except) {
      except = except.map(plugin => this.getState(plugin))
      builder = new Map([...this.builder.entries()].filter(([id]) => !only.includes(id)))
    } else {
      builder = this.builder
    }
    for (const [, functions] of builder) {
      for await (const f of functions) {
        await f()
      }
    }
  }
}
