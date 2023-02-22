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
export declare const schema: Schema<Schemastery.ObjectS<{
    screenshot: Schema<Schemastery.ObjectS<{
        base: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        base: Schema<string, string>;
    }>>;
    server: Schema<import("cosmokit").Dict<Schemastery.ObjectS<{
        default: Schema<boolean, boolean>;
        server: Schema<string, string>;
        mode: Schema<string[], string[]>;
    }>, string>, import("cosmokit").Dict<Schemastery.ObjectT<{
        default: Schema<boolean, boolean>;
        server: Schema<string, string>;
        mode: Schema<string[], string[]>;
    }>, string>>;
    modeAlias: Schema<import("cosmokit").Dict<string[], string>, import("cosmokit").Dict<string[], string>>;
}>, Schemastery.ObjectT<{
    screenshot: Schema<Schemastery.ObjectS<{
        base: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        base: Schema<string, string>;
    }>>;
    server: Schema<import("cosmokit").Dict<Schemastery.ObjectS<{
        default: Schema<boolean, boolean>;
        server: Schema<string, string>;
        mode: Schema<string[], string[]>;
    }>, string>, import("cosmokit").Dict<Schemastery.ObjectT<{
        default: Schema<boolean, boolean>;
        server: Schema<string, string>;
        mode: Schema<string[], string[]>;
    }>, string>>;
    modeAlias: Schema<import("cosmokit").Dict<string[], string>, import("cosmokit").Dict<string[], string>>;
}>>;
export declare const name = "osu-info-command";
export declare function apply(ctx: Context, options: Options): void;
