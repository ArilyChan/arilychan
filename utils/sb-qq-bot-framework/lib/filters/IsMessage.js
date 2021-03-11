module.exports = (meta) => new Promise(resolve => resolve(meta.postType === 'message' || meta.type === 'message'))
