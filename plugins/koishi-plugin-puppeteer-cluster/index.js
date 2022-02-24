const { Context } = require('koishi-core')
const { Cluster } = require('puppeteer-cluster')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const VIEWPORT = { width: 992, height: 100, deviceScaleFactor: 1.5 }
// const crash = (str) => { throw new Error(str || 'something went wrong') }
Context.delegate && Context.delegate('puppeteerCluster')
module.exports.name = 'koishi-plugin-puppeteer-cluster'
module.exports.apply = async (ctx, { cluster: { launch }, viewport, navigation } = {
  cluster: {
    launch: {
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 10,
      puppeteerOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      }
    }
  },
  viewport: VIEWPORT,
  navigation: {
    waitUntil: 'networkidle0'
  }
}) => {
  const status = {
    cluster: {
      inited: false,
      injectedToContext: false
    }
  }
  try {
    const cluster = await Cluster.launch(launch)
    const c = ctx.puppeteerCluster = {
      instance: cluster,

      options: {
        navigation,
        viewport,
        screenshot: {
          type: 'png',
          encoding: 'base64',
          fullPage: true
        }
      },
      _defaultCallback: undefined,
      get defaultCallback () { return c._defaultCallback ?? ctx.puppeteerCluster.utils.screenshot },
      set defaultCallback (newVal) { c._defaultCallback = newVal },

      utils: {
        wait,
        screenshot: async ({ page, data: { url, screenshot, navigation, viewport } = {} }) => {
          if (!url) return
          await page.setViewport(viewport || c.options.viewport)
          await page.goto(url, navigation || c.options.navigation)
          return await page.screenshot(screenshot || c.options.screenshot)
        }
      },

      screenshot: {
        base64: (url, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: 'base64' }, ...options || {} }, c.utils.screenshot),
        binary: (url, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined }, ...options || {} }, c.utils.screenshot),
        save: (url, path, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined, path }, ...options || {} }, c.utils.screenshot)
      },

      status
    }
    cluster.task(c.defaultCallback)
    status.cluster.inited = true
    status.cluster.injectedToContext = true
  } catch (error) {
    status.cluster.inited = false
    status.cluster.injectedToContext = false
    throw error
  }

  ctx.before('disconnect', async () => {
    if (!status.cluster.inited) return
    if (!status.cluster.injectedToContext) return
    await ctx.puppeteerCluster.idle()
    const closeResult = ctx.puppeteerCluster.close().then(res => {
      delete ctx.puppeteerCluster
      return res
    })
    status.cluster.inited = false
    status.cluster.injectedToContext = false
    return closeResult
  })
}
