const isMessage = require('./IsMessage')
module.exports = (...users) => (meta, storage) => isMessage(meta).then(result => {
  if (!result) return true
  else return !users.includes(meta.userId)
})
