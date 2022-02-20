const Base = require('./Base')

module.exports = class Builder extends Base {
  constructor (ci) {
    super(ci)
    this.results = []
  }

  async _runSingle (callback, { id, name }) {
    let result = await callback()
    if (!result) return
    result = { plugin: name, ...result, finished: true }
    this.results.push(result)
    return result
  }

  async _onFinished () {
    return this.results
  }
}
