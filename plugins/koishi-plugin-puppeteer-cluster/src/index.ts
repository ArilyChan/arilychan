import { Page, PuppeteerLifeCycleEvent, ScreenshotOptions, Viewport, WaitForOptions } from 'puppeteer'

import { Context, Schema } from 'koishi'
import { Cluster } from 'puppeteer-cluster'

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const VIEWPORT = { width: 992, height: 100, deviceScaleFactor: 1.5 }

Context.service('puppeteerCluster')
export const name = 'koishi-plugin-puppeteer-cluster'

type config = {
  cluster: {
    launch: {
      concurrency: number,
      maxConcurrency: number,
      puppeteerOptions: {
        headless: boolean,
        args: string[]
      }
    }
  },
  viewport: {
    width: number,
    height: number,
    deviceScaleFactor: number
  },
  navigation: {
    waitUntil: PuppeteerLifeCycleEvent
  }
}
export const schema = Schema.object({
  cluster: Schema.object({
    launch: Schema.object({
      concurrency: Schema.number().default(Cluster.CONCURRENCY_CONTEXT).description('concurrency'),
      maxConcurrency: Schema.number().default(10).description('max concurrency'),
      puppeteerOptions: Schema.object({
        headless: Schema.boolean().default(true).description('start puppeteer in headless mode'),
        args: Schema.array(String).default([
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]).description('puppeteer start options')
      })
    })
  }),
  viewport: Schema.object({
    width: Schema.number(),
    height: Schema.number(),
    deviceScaleFactor: Schema.number()
  }).default(VIEWPORT).description('set default viewport'),
  navigation: Schema.object({
    waitUntil: Schema.string().default('networkidle0').description('wait until')
  })
})
export const apply = async (ctx, options: config) => {
  const { cluster: { launch }, viewport, navigation } = options
  const status = {
    cluster: {
      inited: false,
      injectedToContext: false
    }
  }
  try {
    const cluster = await Cluster.launch(launch)
    const c = {
      instance: cluster,

      options: {
        navigation,
        viewport,
        screenshot: {
          type: 'png' as const,
          encoding: 'base64' as const,
          fullPage: true
        }
      },
      _defaultCallback: undefined,
      get defaultCallback () { return c._defaultCallback ?? (ctx.puppeteerCluster as typeof c).utils.screenshot },
      set defaultCallback (newVal) { c._defaultCallback = newVal },

      utils: {
        wait,
        screenshot: async ({ page, data: { url, screenshot, navigation, viewport } = {} }: {
          page?: Page, data?: {
            url?: string, screenshot?: ScreenshotOptions, navigation?: WaitForOptions & {
              referer?: string;
            }, viewport?: Viewport
          }
        }) => {
          if (!url) return
          await page.setViewport(viewport || c.options.viewport)
          await page.goto(url, navigation || c.options.navigation)
          return await page.screenshot(screenshot || c.options.screenshot)
        }
      },

      screenshot: {
        base64: (url: string | URL, options: ScreenshotOptions) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: 'base64' }, ...options || {} }, c.utils.screenshot),
        binary: (url: string | URL, options: ScreenshotOptions) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined }, ...options || {} }, c.utils.screenshot),
        save: (url: string | URL, path: string, options: ScreenshotOptions) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined, path }, ...options || {} }, c.utils.screenshot)
      },

      status
    }

    ctx.puppeteerCluster = c

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
