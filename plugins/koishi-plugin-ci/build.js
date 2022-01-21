const { Context } = require('koishi')
module.exports = {
  name: 'ci-build',
  apply (ctx) {
    Context.service('build')
    ctx.build = async () => {
      const builders = ctx.ci?.builders
      for await (const builder of builders) {
        await builder()
      }
    }
  }
}
