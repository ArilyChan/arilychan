import { Schema, Context } from 'koishi';
export declare const name = "nyan";
type Opt = {
    noises: string[];
    transformLastLineOnly: boolean;
    legacyMode: boolean;
    trailing: {
        append: string;
        transform: Array<{
            occurrence: string;
            replaceWith: string;
        }>;
    };
};
export declare const schema: Schema<{
    noises?: string[];
    transformLastLineOnly?: boolean;
    legacyMode?: boolean;
    trailing?: {
        append?: string;
        transform?: ({
            occurrence?: string;
            replaceWith?: string;
        } & import("cosmokit").Dict<any, string>)[];
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>, {
    noises: string[];
    transformLastLineOnly: boolean;
    legacyMode: boolean;
    trailing: {
        append: string;
        transform: ({
            occurrence: string;
            replaceWith: string;
        } & import("cosmokit").Dict<any, string>)[];
    } & import("cosmokit").Dict<any, string>;
} & import("cosmokit").Dict<any, string>>;
export declare function apply(ctx: Context, options: Opt): void;
export {};
