const Base = require('./Base')

module.exports = class VersionControl extends Base {
  constructor (ci) {
    super(ci)
    this.results = []
  }

  async check () {
    const handlers = this._filter(...arguments)
    for (const [id, { name, items }] of handlers) {
      for await (const item of items) {
        if (!item.check) return { plugin: name, error: new Error('check function not exists') }
        const result = await this._runSingle(item.check, { id, name })
        this.results.push({ plugin: name, ...result })
      }
    }
    return this._onFinished()
  }

  async update () {
    const handlers = this._filter(...arguments)
    for (const [id, { name, items }] of handlers) {
      for await (const item of items) {
        if (!item.update) return { plugin: name, error: new Error('update function not exists') }
        const result = await this._runSingle(item.check, { id, name })
        if (!result.hasUpdate) continue
        const updateResult = await this._runSingle(item.update, { id, name })
        this.results.push(updateResult)
      }
    }
    return this._onFinished()
  }

  async _runSingle (f, { name }) {
    const result = await f(this.ci?.options?.update)
    if (!result?.hasUpdate) return
    return result
  }

  async _onFinished () {
    return this.results
  }
}
