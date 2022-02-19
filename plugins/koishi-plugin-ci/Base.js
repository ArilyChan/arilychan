module.exports = class Base {
  constructor (ci) {
    this.ci = ci
    this.handlers = new Map()
  }

  use (any) {
    const state = this.ci.getStateRoot(this.ci.getPluginState())
    if (!this.handlers.has(state.id)) {
      this.handlers.set(state.id, {
        name: state.plugin.name,
        items: []
      })
    }
    const { items: current } = this.handlers.get(state.id)
    current.push(any)
  }

  async run () {
    const handlers = this._filter(...arguments)
    for (const [id, { name, items }] of handlers) {
      for await (const item of items) {
        await this._runSingle(item, { id, name })
      }
    }
    return this._onFinished()
  }

  _filter ({ only, except } = {}) {
    let handler
    if (only) {
      only = only.map(plugin => this.ci.getPluginState(plugin).id)
      handler = new Map([...this.handlers.entries()].filter(([id]) => only.includes(id)))
    } else if (except) {
      except = except.map(plugin => this.ci.getPluginState(plugin))
      handler = new Map([...this.handlers.entries()].filter(([id]) => !only.includes(id)))
    } else {
      handler = this.handlers
    }
    return handler
  }
}
