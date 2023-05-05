import { Schema } from 'koishi';
export declare const name = "koishi-plugin-osu-calendar";
export declare const schema: Schema<Schemastery.ObjectS<{
    web: Schema<Schemastery.ObjectS<{
        path: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        path: Schema<string, string>;
    }>>;
    auth: Schema<Schemastery.ObjectS<{
        database: Schema<boolean, boolean>;
        databaseAuthority: Schema<number, number>;
        local: Schema<Schemastery.ObjectS<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>, Schemastery.ObjectT<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>>;
    }>, Schemastery.ObjectT<{
        database: Schema<boolean, boolean>;
        databaseAuthority: Schema<number, number>;
        local: Schema<Schemastery.ObjectS<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>, Schemastery.ObjectT<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>>;
    }>>;
}>, Schemastery.ObjectT<{
    web: Schema<Schemastery.ObjectS<{
        path: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        path: Schema<string, string>;
    }>>;
    auth: Schema<Schemastery.ObjectS<{
        database: Schema<boolean, boolean>;
        databaseAuthority: Schema<number, number>;
        local: Schema<Schemastery.ObjectS<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>, Schemastery.ObjectT<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>>;
    }>, Schemastery.ObjectT<{
        database: Schema<boolean, boolean>;
        databaseAuthority: Schema<number, number>;
        local: Schema<Schemastery.ObjectS<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>, Schemastery.ObjectT<{
            admin: Schema<string[], string[]>;
            blackList: Schema<string[], string[]>;
            whiteList: Schema<string[], string[]>;
        }>>;
    }>>;
}>>;
export declare function apply(ctx: any, options: any): void;
