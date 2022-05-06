import { LaunchOptions, Page, ScreenshotOptions, NavigationOptions, Viewport } from 'puppeteer';
import { ConcurrencyImplementationClassType } from 'puppeteer-cluster/dist/concurrency/ConcurrencyImplementation';
interface ClusterOptions {
    concurrency: number | ConcurrencyImplementationClassType;
    maxConcurrency: number;
    workerCreationDelay: number;
    puppeteerOptions: LaunchOptions;
    perBrowserOptions: LaunchOptions[] | undefined;
    monitor: boolean;
    timeout: number;
    retryLimit: number;
    retryDelay: number;
    skipDuplicateUrls: boolean;
    sameDomainDelay: number;
    puppeteer: any;
}
import { Cluster } from 'puppeteer-cluster'
import { Context } from 'koishi'
type puppeteerCluster = {
  instance: Cluster<string, number>,
  options: {
    viewport?: Partial<Viewport>,
    screenshot?: Partial<ScreenshotOptions>,
    navigation?: Partial<NavigationOptions>
  }
  defaultCallback: ({url: string, ...options}) => Promise<any>
  utils: {
    wait: (ms: number) => Promise<void>
    screenshot: (data: {page: Page, data: { url: string } & Partial<puppeteerCluster['options']>}) => Promise<string | Buffer>
  }
  screenshot: {
    binary: (url: string, options?: puppeteerCluster['options']) => Promise<Buffer>,
    base64: (url: string, options?: puppeteerCluster['options']) => Promise<string>,
    save: (url: string, path: string) => Promise<void>
  }
}

type Options = {
  cluster?: {
    launch?: Partial<ClusterOptions>,
  }
  viewport?: Partial<Viewport>,
  navigation?: Partial<NavigationOptions>
}

declare module 'koishi' {
  interface Context {
    puppeteerCluster: puppeteerCluster
  }
  namespace Plugin {
    interface Packages {
      'koishi-plugin-puppeteer-cluster': typeof import('.')
    }
  }
}

declare namespace plugin {
  const name: string
  const apply: (ctx: Context, options: Options) => Promise<void>
}

export default plugin