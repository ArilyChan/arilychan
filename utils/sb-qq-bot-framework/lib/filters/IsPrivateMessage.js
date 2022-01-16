const isMessage = require('./IsMessage')

module.exports = (meta) => isMessage(meta).then(res => res && (meta.contentType === 'private' || meta.subType === 'private'))
