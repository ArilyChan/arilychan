function req (req, def = {}) {
  try {
    return require(req)
  } catch (error) {
    console.log(error)
    return def
  }
}

// require('koishi-adapter-cqhttp')
require('koishi-adapter-irc')

exports.koishi = req('./koishi')
exports.contextPlugins = req(process.env.PLUGIN_CONFIG || './contextPlugins', [])
