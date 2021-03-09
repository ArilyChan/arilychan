const isGroupMessage = require('./IsGroupMessage')

module.exports = (groupUser) => (meta, storage) => isGroupMessage(meta).then(isGroupMessage => {
  if (!isGroupMessage) return true
  if (!groupUser[meta.groupId]) return true
  return !groupUser[meta.groupId].includes(meta.userId)
})
