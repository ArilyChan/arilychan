// eslint-disable-next-line no-unused-vars
const asyncSome = async (arr, predicate) => {
  for (const e of arr) {
    if (await predicate(e)) return true
  }
  return false
}
const asyncEvery = async (arr, predicate) => {
  for (const e of arr) {
    if (!await predicate(e)) return false
  }
  return true
}

const isFunction = function (functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

class WrappedPlugin {
  constructor (obj) {
    Object.assign(this, obj)
  }

  appendPrependFilter (...filters) {
    if (!this.wrapper) throw new Error('not an wrapped plugin')

    this.wrapper.prependFilter.push(...filters)
  }

  appendFilter (...filters) {
    if (!this.wrapper) throw new Error('not an wrapped plugin')

    this.wrapper.filter.push(...filters)
  }

  getWrappedPlugin (app, options, storage) {
    try {
      this.wrapper.wrap(app, options, storage)
      if (this.wrapper.realPrependMiddleware.length) this.wrapper.realPrependMiddleware.map(async middleware => app.prependMiddleware(await this.wrapper.wrapSinglePrependMiddleware(middleware)))
      if (this.wrapper.realMiddleware.length) this.wrapper.realMiddleware.map(async middleware => app.middleware(await this.wrapper.wrapSinglePrependMiddleware(middleware)))
    } catch (error) {
      console.warn(error)
    }
  }
}
class RuntimeError extends Error {}

function ObsoleteReminder (message, ctx) {
  this.name = 'ObsoleteReminder'

  this.message = message || ''

  Error.captureStackTrace(this, ObsoleteReminder)
  Error.stackTraceLimit = 2
}
require('util').inherits(ObsoleteReminder, Error)

class PluginWrapper {
  constructor (plugin, { filter, prependFilter, subPlugin, useFilter = true, useV2Adapt = true, ...others }) {
    if (isFunction(filter)) filter = [filter]
    if (isFunction(prependFilter)) prependFilter = [prependFilter]

    if (plugin instanceof WrappedPlugin) {
      if (prependFilter) plugin.appendPrependFilter(...prependFilter)
      if (filter) plugin.appendFilter(...filter)
      return {
        createWrappedPlugin () {
          return plugin
        }
      }
    }

    this.plugin = new WrappedPlugin(plugin)
    this.subPlugin = subPlugin

    this.useFilter = useFilter
    this.useV2Adapt = useV2Adapt

    this.filter = filter || ([() => true])
    this.prependFilter = prependFilter || ([() => true])
    this.realMiddleware = []
    this.realPrependMiddleware = []
    this.storage = undefined
    if (this.subPlugin && this.plugin[this.subPlugin]) this.realApply = this.plugin[this.subPlugin].apply.bind(this.plugin[this.subPlugin])
    else this.realApply = this.plugin.apply.bind(this.plugin)
    this.plugin.wrapper = this
  }

  /** Mixin apps with wrapper
     *  @var app Koish_JS context or app
     *  @returns Fakeapp
     */
  app (app) {
    return Object.assign({
      middleware: (fn) => { this.realMiddleware.push(fn) },
      prependMiddleware: (fn) => { this.realPrependMiddleware.push(fn) }
    }, app)
  }

  /** Mixin apps with wrapper
     *  @var app Koish_JS context or app
     *  @var options options for plugin
     *  @var storage shared-state for sb extended web views
     *  @returns undefined
     */
  wrap (app, options, storage) {
    if (!this.realApply) return
    this.storage = storage
    this.realApply(this.app(app), options, storage)
  }

  doFilter (filter, meta) {
    // if (isFunction(filter)) return filter(meta, this.storage)
    if (!Array.isArray(filter)) throw new RuntimeError('Unknown filter type. function or Array required')
    // Array of filters
    return asyncEvery(filter, f => f(meta, this.storage)).catch(rejected => false)
  }

  async filtering (meta) {
    return this.doFilter(this.filter, meta)
  }

  async prependFiltering (meta) {
    return this.doFilter(this.prependFilter, meta)
  }

  v2BCMeta (session) {
    if (session?.v2Wrap) return session
    session = Object.assign(session, {})
    if (!session.sender) {
      Object.defineProperty(session, 'sender', {
        get () {
          session.app
            .logger('plugin-wrapper')
            .warn(new ObsoleteReminder('Session.sender is removed in v3.', this).stack)
          return {
            userId: session.userId,
            channelId: session.channelId,
            nickname: session.userId
          }
        },
        enumerable: true
      })
    }
    if (!session.message) {
      Object.defineProperty(session, 'message', {
        get () {
          session.app
            .logger('plugin-wrapper')
            .warn(new ObsoleteReminder('please use session.content in v3.', this).stack)
          return session.content
        },
        set (newValue) {
          session.content = newValue
        },
        enumerable: true,
        configurable: true
      })
    }
    if (!session.$parsed) {
      Object.defineProperty(session, '$parsed', {
        get () {
          session.app
            .logger('plugin-wrapper')
            .warn(new ObsoleteReminder('Session.$parsed is removed in v3.', this).stack)
          return {
            message: session.content.trim()
          }
        },
        enumerable: true,
        configurable: true
      })
    }
    if (!session.$send) {
      session.$send = (...args) => {
        session.app
          .logger('plugin-wrapper')
          .warn(new ObsoleteReminder('please use session.send() in v3.', this).stack)
        return session.send(...args)
      }
    }
    session.v2Wrap = true
    return session
  }

  async wrapSinglePrependMiddleware (middleware) {
    return async (meta, next) => {
      if (this.useV2Adapt) meta = this.v2BCMeta(meta)
      if (this.useFilter && !await this.prependFiltering(meta)) return next()
      return middleware(meta, next)
    }
  }

  async wrapSingleMiddleware (middleware) {
    return async (meta, next) => {
      if (this.useV2Adapt) meta = this.v2BCMeta(meta)
      if (this.useFilter && !await this.filtering(meta)) return next()
      return middleware(meta, next)
    }
  }

  createWrappedPlugin () {
    if (this.subPlugin && this.plugin[this.subPlugin]) this.plugin[this.subPlugin].apply = this.plugin.getWrappedPlugin.bind(this.plugin)
    else this.plugin.apply = this.plugin.getWrappedPlugin.bind(this.plugin)
    return this.plugin
  }
}

module.exports = PluginWrapper
