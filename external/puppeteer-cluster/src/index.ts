import { Context, Schema } from "koishi";
import { Cluster } from "puppeteer-cluster";
import {} from "puppeteer";
const { object, number, boolean, array, union, const: literal } = Schema;
declare module "koishi" {
  interface Context {
    puppeteerCluster: {
      instance: Cluster<any, any>;
      options: {
        navigation: {
          waitUntil: string;
        };
        viewport: {
          width: number;
          height: number;
          deviceScaleFactor: number;
        };
        screenshot: {
          type: string;
          encoding: string;
          fullPage: boolean;
        };
      };
      utils: {
        wait: (ms: number) => Promise<unknown>;
        screenshot: ({
          page,
          data: { url, screenshot, navigation, viewport },
        }: {
          page: any;
          data?: {
            url: any;
            screenshot: any;
            navigation: any;
            viewport: any;
          };
        }) => Promise<any>;
      };
      screenshot: {
        base64: (url: string, options: any) => Promise<string>;
        binary: (url: string, options: any) => Promise<Buffer>;
        save: (url: string, path: string, options: any) => Promise<any>;
      };
      status: {
        cluster: {
          inited: boolean;
          injectedToContext: boolean;
        };
      };
    };
  }
}
type InferSchema<T> =
  T extends Schema<infer R>
    ? R extends Schemastery.ObjectS<infer RR>
      ? {
          [K in keyof RR]: InferSchema<RR[K]>;
        }
      : InferSchema<R>
    : T;

const waitUntil = union([literal("networkIdle0")]);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const name = "koishi-plugin-puppeteer-cluster";
export const reusable = false;
export const schema = object({
  cluster: object({
    launch: object({
      concurrency: number().default(Cluster.CONCURRENCY_CONTEXT),
      maxConcurrency: number().default(1),
      puppeteerOptions: object({
        headless: boolean().default(true),
        args: array(String).default([
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ]),
      }),
    }),
  }),
  viewport: object({
    width: number().default(992),
    height: number().default(100),
    deviceScaleFactor: number().default(1.5),
  }),
  navigation: object({
    waitUntil: waitUntil,
  }),
});
export interface Config extends InferSchema<typeof schema> {}

const status = {
  cluster: {
    inited: false,
    injectedToContext: false,
  },
};

export async function apply(ctx: Context, config: Config) {
  const {
    cluster: { launch },
    navigation,
    viewport,
  } = config;

  ctx.provide("puppeteerCluster");

  try {
    const cluster = await Cluster.launch(launch);
    status.cluster.inited = true;

    const c: (typeof Context)["prototype"]["puppeteerCluster"] =
      (ctx.puppeteerCluster = {
        instance: cluster,

        options: {
          navigation,
          viewport,
          screenshot: {
            type: "png",
            encoding: "base64",
            fullPage: true,
          },
        },
        utils: {
          wait,
          screenshot: async ({
            page,
            data: { url, screenshot, navigation, viewport } = {},
          }) => {
            if (!url) return;
            await page.setViewport(viewport || c.options.viewport);
            await page.goto(url, navigation || c.options.navigation);
            return await page.screenshot(screenshot || c.options.screenshot);
          },
        },

        screenshot: {
          base64: (url, options) =>
            cluster.execute(
              {
                url,
                screenshot: { ...c.options.screenshot, encoding: "base64" },
                ...(options || {}),
              },
              c.utils.screenshot,
            ),
          binary: (url, options) =>
            cluster.execute(
              {
                url,
                screenshot: { ...c.options.screenshot, encoding: undefined },
                ...(options || {}),
              },
              c.utils.screenshot,
            ),
          save: (url, path, options) =>
            cluster.execute(
              {
                url,
                screenshot: {
                  ...c.options.screenshot,
                  encoding: undefined,
                  path,
                },
                ...(options || {}),
              },
              c.utils.screenshot,
            ),
        },

        status,
      } as (typeof Context)["prototype"]["puppeteerCluster"]);

    status.cluster.injectedToContext = true;
  } catch (error) {
    const logger = ctx.logger("puppeteer-cluster");
    logger.error(error);
    logger.error("Error detected during start process.");
    unwind(ctx);
    throw error;
  }

  ctx.on("dispose", () => unwind(ctx));
}
async function shutdownGracefully(ctx: Context) {
  await ctx.puppeteerCluster.instance.idle();
  await ctx.puppeteerCluster.instance.close();
  status.cluster.inited = false;
}
function disposeInjection(ctx: Context) {
  delete ctx.puppeteerCluster;
  status.cluster.injectedToContext = false;
}
async function unwind(ctx: Context) {
  if (status.cluster.inited) {
    await shutdownGracefully(ctx).catch((err) => panic(ctx, err));
  }
  if (status.cluster.injectedToContext) {
    disposeInjection(ctx);
  }
}

function panic(ctx: Context, err: Error) {
  ctx.puppeteerCluster.instance.removeAllListeners();
  const logger = ctx.logger("puppeteer-cluster");
  logger.error(err);
  logger.error("Fatal Error detected, Ending Node process.");
  process.exit(1);
}
