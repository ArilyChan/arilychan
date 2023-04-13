/// <reference types="node" />
import { Page, PuppeteerLifeCycleEvent, ScreenshotOptions } from 'puppeteer';
import { Context, Schema } from 'koishi';
import { Cluster } from 'puppeteer-cluster';
type Screenshot = ScreenshotOptions;
type Config = {
    cluster: {
        launch: {
            concurrency: number;
            maxConcurrency: number;
            puppeteerOptions: {
                headless: boolean;
                args: string[];
            };
        };
    };
    viewport: {
        width: number;
        height: number;
        deviceScaleFactor: number;
    };
    navigation: {
        waitUntil: PuppeteerLifeCycleEvent;
    };
};
declare module 'koishi' {
    interface Context {
        puppeteerCluster: {
            instance: Cluster;
            options: {
                navigation: Config['navigation'];
                viewport: Config['viewport'];
                screenshot: Screenshot;
            };
            _defaultCallback?: () => {};
            defaultCallback: CallableFunction;
            utils: {
                wait: (ms: number) => Promise<any>;
                screenshot: (opt: {
                    page: Page;
                    data: {
                        url: string;
                        screenshot: Screenshot;
                        viewport: Config['viewport'];
                    };
                }) => Promise<any>;
            };
            screenshot: {
                base64: (url: string | URL, options: ScreenshotOptions) => Promise<string>;
                binary: (url: string | URL, options: ScreenshotOptions) => Promise<Buffer>;
                save: (url: string | URL, options: ScreenshotOptions) => Promise<any>;
            };
        };
    }
}
export declare const name = "koishi-plugin-puppeteer-cluster";
export declare const schema: Schema<Schemastery.ObjectS<{
    cluster: Schema<Schemastery.ObjectS<{
        launch: Schema<Schemastery.ObjectS<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>, Schemastery.ObjectT<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>>;
    }>, Schemastery.ObjectT<{
        launch: Schema<Schemastery.ObjectS<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>, Schemastery.ObjectT<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>>;
    }>>;
    viewport: Schema<Schemastery.ObjectS<{
        width: Schema<number, number>;
        height: Schema<number, number>;
        deviceScaleFactor: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        width: Schema<number, number>;
        height: Schema<number, number>;
        deviceScaleFactor: Schema<number, number>;
    }>>;
    navigation: Schema<Schemastery.ObjectS<{
        waitUntil: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        waitUntil: Schema<string, string>;
    }>>;
}>, Schemastery.ObjectT<{
    cluster: Schema<Schemastery.ObjectS<{
        launch: Schema<Schemastery.ObjectS<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>, Schemastery.ObjectT<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>>;
    }>, Schemastery.ObjectT<{
        launch: Schema<Schemastery.ObjectS<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>, Schemastery.ObjectT<{
            concurrency: Schema<number, number>;
            maxConcurrency: Schema<number, number>;
            puppeteerOptions: Schema<Schemastery.ObjectS<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>, Schemastery.ObjectT<{
                headless: Schema<boolean, boolean>;
                args: Schema<string[], string[]>;
            }>>;
        }>>;
    }>>;
    viewport: Schema<Schemastery.ObjectS<{
        width: Schema<number, number>;
        height: Schema<number, number>;
        deviceScaleFactor: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        width: Schema<number, number>;
        height: Schema<number, number>;
        deviceScaleFactor: Schema<number, number>;
    }>>;
    navigation: Schema<Schemastery.ObjectS<{
        waitUntil: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        waitUntil: Schema<string, string>;
    }>>;
}>>;
export declare const apply: (ctx: Context, options: Config) => Promise<void>;
export {};
