const api = require('./api')

// Koishi插件名
module.exports.name = 'koishi-plugin-netease'
// 插件处理和输出
module.exports.apply = (ctx) => {
  ctx.middleware(async (meta, next) => {
    let ask = meta.content
    ask = ask.trim()
    if (ask.startsWith('!163') || ask.startsWith('！163')) {
      try {
        const str = ask.substring(4).trim()
        const reply = await api.search(str)
        meta.send(reply)
      } catch (ex) {
        console.log(ex)
      }
    } else {
      return next()
    }
  })
}
