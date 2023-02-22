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
export declare const schema: Schema<Schemastery.ObjectS<{
    noises: Schema<string[], string[]>;
    transformLastLineOnly: Schema<boolean, boolean>;
    legacyMode: Schema<boolean, boolean>;
    trailing: Schema<Schemastery.ObjectS<{
        append: Schema<string, string>;
        transform: Schema<Schemastery.ObjectS<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[], Schemastery.ObjectT<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[]>;
    }>, Schemastery.ObjectT<{
        append: Schema<string, string>;
        transform: Schema<Schemastery.ObjectS<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[], Schemastery.ObjectT<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[]>;
    }>>;
}>, Schemastery.ObjectT<{
    noises: Schema<string[], string[]>;
    transformLastLineOnly: Schema<boolean, boolean>;
    legacyMode: Schema<boolean, boolean>;
    trailing: Schema<Schemastery.ObjectS<{
        append: Schema<string, string>;
        transform: Schema<Schemastery.ObjectS<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[], Schemastery.ObjectT<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[]>;
    }>, Schemastery.ObjectT<{
        append: Schema<string, string>;
        transform: Schema<Schemastery.ObjectS<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[], Schemastery.ObjectT<{
            occurrence: Schema<string, string>;
            replaceWith: Schema<string, string>;
        }>[]>;
    }>>;
}>>;
export declare function apply(ctx: Context, options: Opt): void;
export {};
