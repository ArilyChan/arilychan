"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
const puppeteer_cluster_1 = require("puppeteer-cluster");
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const VIEWPORT = { width: 992, height: 100, deviceScaleFactor: 1.5 };
koishi_1.Context.service('puppeteerCluster');
exports.name = 'koishi-plugin-puppeteer-cluster';
exports.schema = koishi_1.Schema.object({
    cluster: koishi_1.Schema.object({
        launch: koishi_1.Schema.object({
            concurrency: koishi_1.Schema.number().default(puppeteer_cluster_1.Cluster.CONCURRENCY_CONTEXT).description('concurrency'),
            maxConcurrency: koishi_1.Schema.number().default(10).description('max concurrency'),
            puppeteerOptions: koishi_1.Schema.object({
                headless: koishi_1.Schema.boolean().default(true).description('start puppeteer in headless mode'),
                args: koishi_1.Schema.array(String).default([
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]).description('puppeteer start options')
            })
        })
    }),
    viewport: koishi_1.Schema.object({
        width: koishi_1.Schema.number(),
        height: koishi_1.Schema.number(),
        deviceScaleFactor: koishi_1.Schema.number()
    }).default(VIEWPORT).description('set default viewport'),
    navigation: koishi_1.Schema.object({
        waitUntil: koishi_1.Schema.string().default('networkidle0').description('wait until')
    })
});
const apply = async (ctx, options) => {
    const { cluster: { launch }, viewport, navigation } = options;
    const status = {
        cluster: {
            inited: false,
            injectedToContext: false
        }
    };
    try {
        const cluster = await puppeteer_cluster_1.Cluster.launch(launch);
        const c = {
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
            get defaultCallback() { return c._defaultCallback ?? ctx.puppeteerCluster.utils.screenshot; },
            set defaultCallback(newVal) { c._defaultCallback = newVal; },
            utils: {
                wait,
                screenshot: async ({ page, data: { url, screenshot, navigation, viewport } = {} }) => {
                    if (!url)
                        return;
                    await page.setViewport(viewport || c.options.viewport);
                    await page.goto(url, navigation || c.options.navigation);
                    return await page.screenshot(screenshot || c.options.screenshot);
                }
            },
            screenshot: {
                base64: (url, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: 'base64' }, ...options || {} }, c.utils.screenshot),
                binary: (url, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined }, ...options || {} }, c.utils.screenshot),
                save: (url, path, options) => cluster.execute({ url, screenshot: { ...c.options.screenshot, encoding: undefined, path }, ...options || {} }, c.utils.screenshot)
            },
            status
        };
        ctx.puppeteerCluster = c;
        cluster.task(c.defaultCallback);
        status.cluster.inited = true;
        status.cluster.injectedToContext = true;
    }
    catch (error) {
        status.cluster.inited = false;
        status.cluster.injectedToContext = false;
        throw error;
    }
    ctx.before('disconnect', async () => {
        if (!status.cluster.inited)
            return;
        if (!status.cluster.injectedToContext)
            return;
        await ctx.puppeteerCluster.idle();
        const closeResult = ctx.puppeteerCluster.close().then(res => {
            delete ctx.puppeteerCluster;
            return res;
        });
        status.cluster.inited = false;
        status.cluster.injectedToContext = false;
        return closeResult;
    });
};
exports.apply = apply;
