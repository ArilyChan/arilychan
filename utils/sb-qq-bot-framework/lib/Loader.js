// const runtimeInstaller = require('./runtimeModuleInstaller')
const pluginApplier = require('./pluginLoader').usePlugins

const path = require('path')
const appDir = path.dirname(require.main.filename)
// const Wrapper = require('./Wrapper')

class Loader {
  constructor (plugins, options) {
    this.plugins = []
    this.webApps = []
    plugins.map((plugin) => {
      try {
        switch (plugin.type) {
          case 'node_module':
            this.loadPlugin(plugin)
            break

          case 'local':
            this.loadLocalPlugin(plugin)
            break
          case 'module':
          default:
            if (!plugin.module) throw new Error('undefined plugin')
            this.loadModule(plugin.module, plugin)
            break
        }
      } catch (error) {
        console.warn('Error when loading Module!\n', error)
      }
      return undefined
    })
    // this.initPluginsWrapper();
    this.options = options
  }

  loadModule (module, config) {
    switch (typeof module) {
      case 'object':
      case 'function':
        this.plugins.push({ module, config })
        break
      default: {
        console.error(typeof module)
      }
    }
  }

  async installToContext (app) {
    const { normal, after } = this.plugins.reduce(
      (acc, cur) => {
        // if (cur.config.useV2Adapt) {
        //   cur.module = Wrapper(cur.module, cur.config)
        // }
        if (!cur.config.priority) cur.config.priority = 0
        if (cur.config.priority >= 0) {
          acc.normal.push(cur)
        } else {
          acc.after.push(cur)
        }
        return acc
      },
      {
        normal: [],
        after: []
      }
    )
    // normal.sort((a, b) => b.config.priority - a.config.priority)
    // after.sort((a, b) => a.config.priority - b.config.priority)
    const normalWebViews = await pluginApplier(app, normal)
    const afterWebViews = await pluginApplier(app, after)
    this.webApps.push(...normalWebViews, ...afterWebViews)
  }

  loadPlugin (plugin) {
    try {
      this.loadModule(require(plugin.require), plugin)
    } catch (error) {
      console.warn('error when loading node_module', plugin.require, error.stack)
    }
  }

  loadLocalPlugin (plugin) {
    try {
      this.loadModule(require(plugin.path), plugin)
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        try {
          this.loadModule(require(`${appDir}/${plugin.path}`), plugin)
        } catch (error) {
          console.warn(
            'make sure that you installed all the requirements in your main app'
          )
          throw error
        }
      } else {
        throw error
      }
    }
  }
}

module.exports = Loader
