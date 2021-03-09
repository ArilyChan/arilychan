const isGroupMessage = require('./IsGroupMessage')
module.exports = (...groups) => (meta, storage) => isGroupMessage(meta).then(result => {
  if (!result) return true
  else return !groups.includes(meta.groupId)
})
