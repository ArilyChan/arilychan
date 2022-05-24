import { Context } from 'koishi';
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
export declare const schema: any;
export declare const name = "osu-info-command";
export declare function apply(ctx: Context, options: Options): void;
