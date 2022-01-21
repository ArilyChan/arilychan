const { Context } = require('koishi')
const build = require('./build')
const useBuild = require('./useBuild')

module.exports = {
  name: 'ci',
  apply (ctx) {
    if ('ci' in ctx) return

    ctx.plugin(build)
    ctx.plugin(useBuild)
    Context.service('ci')
    ctx.ci = {
      builders: []
    }
  }
}
