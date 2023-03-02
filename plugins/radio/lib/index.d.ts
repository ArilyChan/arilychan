import { Context, Schema } from 'koishi';
export declare const name = "arilychan-radio";
export declare const schema: Schema<Schemastery.ObjectS<{
    expire: Schema<number, number>;
    web: Schema<Schemastery.ObjectS<{
        path: Schema<string, string>;
        host: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        path: Schema<string, string>;
        host: Schema<string, string>;
    }>>;
}>, Schemastery.ObjectT<{
    expire: Schema<number, number>;
    web: Schema<Schemastery.ObjectS<{
        path: Schema<string, string>;
        host: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        path: Schema<string, string>;
        host: Schema<string, string>;
    }>>;
}>>;
export type Config = {
    expire: number;
    web: {
        path: string;
        host: string;
    };
};
export declare const apply: (ctx: Context, options: Config) => Promise<void>;
