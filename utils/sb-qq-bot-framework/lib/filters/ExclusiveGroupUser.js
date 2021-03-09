const { isGroupMessage } = require('./IsGroupMessage')

module.exports = (groupUser) => (meta, storage) => isGroupMessage(meta).then(isGroup => {
  if (!isGroup) return true
  if (!groupUser[meta.groupId]) return true
  return groupUser[meta.groupId].includes(meta.userId)
})
