exports.name = 'recorder slipper'
exports.apply = (ctx, options, storage) => {
  if (!storage) throw new Error('no storage attached')
  ctx.middleware((meta, next) => {
    // if (meta.$parsed.atMe || meta.$parsed.nickname || meta.$parsed.prefix) {
    // }
    storage.delete(meta)
    return next()
  })
}
