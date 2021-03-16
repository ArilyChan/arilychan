// const analyzeUsage = require('./function/usage')
exports.name = 'recorder recorder'
exports.apply = (ctx, options, storage) => {
  if (!storage) throw new Error('no storage attached')
  ctx.prependMiddleware((meta, next) => {
    if (meta.postType !== 'message') return next()

    // const prefix = () => ctx.options.commandPrefix.some(start => meta.content.startsWith(start))
    // const nickname = () => meta.content.startsWith(ctx.options.name)
    // const atMe = () => meta.content.startsWith(`[CQ:at,id=${meta.selfId}]`)
    try {
      // if (prefix() || nickname() || atMe()) {
      // if (meta.content.includes('recorder.print')) return console.log(storage)

      // if (meta.content.includes('usage')) return analyzeUsage(storage, meta)

      storage.record(meta)
      // }
      return next()
    } catch (error) {
      console.log(error)
    }
  })
}
