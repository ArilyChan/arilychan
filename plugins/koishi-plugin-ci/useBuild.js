const { Context } = require('koishi')
module.exports = {
  name: 'ci-useBuild',
  apply (ctx) {
    Context.service('useBuild')
    ctx.useBuild = (buildFunc) => {
      ctx.ci?.builders.push(buildFunc)
    }
  }
}
