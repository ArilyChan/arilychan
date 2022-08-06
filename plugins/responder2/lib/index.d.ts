import { Context, Schema, Session } from 'koishi';
export declare type returnedValue = any;
export declare type CustomMatcher = (session: Session, context: Context, resolve: (carry: returnedValue) => void, reject: () => void) => Promise<returnedValue> | returnedValue;
export declare type Action = (session: Session, context: Context, returnedValue: returnedValue) => Promise<string | undefined>;
export declare type Match = CustomMatcher;
export declare type Respond = [Match, Action];
export declare function commandBuilder(logger: any): [Respond[], CallableFunction];
export declare const name = "yet-another-responder";
export declare const schema: Schema<{
    rules?: string[];
} & import("cosmokit").Dict<any, string>, {
    rules: string[];
} & import("cosmokit").Dict<any, string>>;
export interface Options {
    rules: string[];
}
export declare function apply(ctx: Context, options: Options): void;
