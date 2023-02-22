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
export declare const schema: Schema<{
    cluster?: {
        launch?: {
            concurrency?: number;
            maxConcurrency?: number;
            puppeteerOptions?: {
                headless?: boolean;
                args?: string[];
            } & import("cosmokit").Dict<any, string>;
        } & import("cosmokit").Dict<any, string>;
    } & import("cosmokit").Dict<any, string>;
    viewport?: {
        width?: number;
        height?: number;
        deviceScaleFactor?: number;
    } & import("cosmokit").Dict<any, string>;
    navigation?: {
        waitUntil?: string;
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>, {
    cluster: {
        launch: {
            concurrency: number;
            maxConcurrency: number;
            puppeteerOptions: {
                headless: boolean;
                args: string[];
            } & import("cosmokit").Dict<any, string>;
        } & import("cosmokit").Dict<any, string>;
    } & import("cosmokit").Dict<any, string>;
    viewport: {
        width: number;
        height: number;
        deviceScaleFactor: number;
    } & import("cosmokit").Dict<any, string>;
    navigation: {
        waitUntil: string;
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>>;
export declare const apply: (ctx: any, options: config) => Promise<void>;
export {};
