import { PuppeteerLifeCycleEvent } from 'puppeteer';
import { Schema } from 'koishi';
export declare const name = "koishi-plugin-puppeteer-cluster";
type config = {
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
export declare const apply: (ctx: any, options: config) => Promise<void>;
export {};
