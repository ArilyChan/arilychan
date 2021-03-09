function req (req, def = {}) {
  try {
    return require(req)
  } catch (error) {
    console.log(error)
    return def
  }
}

require('koishi-adapter-cqhttp')

exports.koishi = req('./koishi')
exports.contextPlugins = req('./contextPlugins', [])
