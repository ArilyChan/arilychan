const bot = require('./lib/Bot')
const commandLoader = require('./lib/commandLoader')
const contextBuilder = require('./lib/contextBuilder')
const InstallContextPlugin = require('./lib/InstallContextPlugin')
const Loader = require('./lib/Loader')
const pluginLoader = require('./lib/pluginLoader')
// const runtimeModuleInstaller = require('./lib/runtimeModuleInstaller')
const WebServer = require('./lib/Webserver')
const Wrapper = require('./lib/Wrapper')
const filters = require('./lib/filters')

module.exports = {
  bot,
  commandLoader,
  contextBuilder,
  InstallContextPlugin,
  Loader,
  pluginLoader,
  WebServer,
  Wrapper,
  filters
}
