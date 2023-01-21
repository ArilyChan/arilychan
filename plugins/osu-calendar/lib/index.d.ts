import { Schema } from 'koishi';
export declare const name = "koishi-plugin-osu-calendar";
export declare const schema: Schema<{
    web?: {
        path?: string;
    } & import("cosmokit").Dict<any, string>;
    auth?: {
        database?: boolean;
        databaseAuthority?: number;
        local?: {
            admin?: string[];
            blackList?: string[];
            whiteList?: string[];
        } & import("cosmokit").Dict<any, string>;
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>, {
    web: {
        path: string;
    } & import("cosmokit").Dict<any, string>;
    auth: {
        database: boolean;
        databaseAuthority: number;
        local: {
            admin: string[];
            blackList: string[];
            whiteList: string[];
        } & import("cosmokit").Dict<any, string>;
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>>;
export declare function apply(ctx: any, options: any): void;
