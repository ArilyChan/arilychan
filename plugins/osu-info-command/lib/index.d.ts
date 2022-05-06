/// <reference path="database/index.d.ts" />
/// <reference types="koishi/lib" />
import { Context, Schema } from 'koishi';
export interface Options {
    screenshot: {
        base: string;
    };
    server: Array<{
        default: boolean;
        server: string;
        mode: string[];
    }>;
    modeAlias: Record<string, string[]>;
}
export declare const schema: Schema<{
    screenshot?: {
        base?: string;
    } & import("koishi").Dict<any, string>;
    server?: import("koishi").Dict<{
        default?: boolean;
        server?: string;
        mode?: string[];
    } & import("koishi").Dict<any, string>, string>;
    modeAlias?: import("koishi").Dict<string[], string>;
} & import("koishi").Dict<any, string>, {
    screenshot: {
        base: string;
    } & import("koishi").Dict<any, string>;
    server: import("koishi").Dict<{
        default: boolean;
        server: string;
        mode: string[];
    } & import("koishi").Dict<any, string>, string>;
    modeAlias: import("koishi").Dict<string[], string>;
} & import("koishi").Dict<any, string>>;
export declare const name = "osu-info-command";
export declare function apply(ctx: Context, options: Options): void;
