const path = require('path')
function req (req, def = {}) {
  try {
    return require(req)
  } catch (error) {
    console.log(error)
    return def
  }
}

require('./inject-manual.js')

const args = process.argv.slice(2)
const resolvePreset = () => args.join(' ') || process.env.PLUGIN_CONFIG || './default.js'
exports.koishi = {
  port: 3006
}

exports.contextPlugins = req(path.resolve(__dirname, path.join('./load-plugin-presets', resolvePreset())), [])
