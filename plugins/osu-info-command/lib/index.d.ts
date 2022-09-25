import { Context, Schema } from 'koishi';
export interface Options {
    screenshot: {
        base: string;
    };
    server: Record<string, {
        default: boolean;
        server: string;
        mode: string[];
    }>;
    modeAlias: Record<string, string[]>;
}
export declare const schema: Schema<{
    screenshot?: {
        base?: string;
    } & import("cosmokit").Dict<any, string>;
    server?: import("cosmokit").Dict<{
        default?: boolean;
        server?: string;
        mode?: string[];
    } & import("cosmokit").Dict<any, string>, string>;
    modeAlias?: import("cosmokit").Dict<string[], string>;
} & import("cosmokit").Dict<any, string>, {
    screenshot: {
        base: string;
    } & import("cosmokit").Dict<any, string>;
    server: import("cosmokit").Dict<{
        default: boolean;
        server: string;
        mode: string[];
    } & import("cosmokit").Dict<any, string>, string>;
    modeAlias: import("cosmokit").Dict<string[], string>;
} & import("cosmokit").Dict<any, string>>;
export declare const name = "osu-info-command";
export declare function apply(ctx: Context, options: Options): void;
