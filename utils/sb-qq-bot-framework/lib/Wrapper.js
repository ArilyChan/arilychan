const PluginWrapper = require('sb-plugin-wrapper')
module.exports = (plugin, options) => new PluginWrapper(plugin, options).createWrappedPlugin()
