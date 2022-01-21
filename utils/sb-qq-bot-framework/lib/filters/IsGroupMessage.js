const isMessage = require('./IsMessage')

module.exports = (meta) => isMessage(meta).then(res => res && (meta.contentType === 'group' || meta.subType === 'group'))
