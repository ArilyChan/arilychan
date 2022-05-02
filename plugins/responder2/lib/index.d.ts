/// <reference types="koishi/lib" />
import { Context, Schema } from 'koishi';
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
