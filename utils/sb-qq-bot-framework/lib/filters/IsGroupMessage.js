const isMessage = require('./IsMessage')

module.exports = (meta) => isMessage(meta).then(res => res && (meta.messageType === 'group' || meta.subType === 'group'))
