// const analyzeUsage = require('./function/usage')
exports.name = 'recorder recorder'
exports.apply = (ctx, options, storage) => {
  if (!storage) throw new Error('no storage attached')
  ctx.prependMiddleware((meta, next) => {
    if (meta.postType !== 'message') return next()

    // const prefix = () => ctx.options.commandPrefix.some(start => meta.message.startsWith(start))
    // const nickname = () => meta.message.startsWith(ctx.options.name)
    // const atMe = () => meta.message.startsWith(`[CQ:at,qq=${meta.selfId}]`)
    try {
      // if (prefix() || nickname() || atMe()) {
      // if (meta.message.includes('recorder.print')) return console.log(storage)

      // if (meta.message.includes('usage')) return analyzeUsage(storage, meta)

      storage.record(meta)
      // }
      return next()
    } catch (error) {
      console.log(error)
    }
  })
}
