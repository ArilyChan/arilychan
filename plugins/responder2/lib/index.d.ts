/// <reference types="koishi/lib" />
import { Context, Schema, Session } from 'koishi';
export declare type CustomMatcher = (session: Session, context: Context) => Promise<boolean> | boolean;
export declare type Match = CustomMatcher;
export declare type Action = (session: Session, context: Context) => string | Promise<string>;
export declare type Respond = [Match, Action];
export declare function commandBuilder(logger: any): [Respond[], CallableFunction];
export declare const name = "yet-another-responder";
export declare const schema: Schema<{
    rules?: string[];
} & import("koishi").Dict<any, string>, {
    rules: string[];
} & import("koishi").Dict<any, string>>;
export interface schema {
    rules: string[];
}
export declare function apply(ctx: Context, _options: any): void;
