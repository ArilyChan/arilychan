import { Context, Schema } from 'koishi';
export declare const name = "meal";
export interface Config {
}
export declare const schema: Schema<Config>;
export declare function apply(ctx: Context, options: Config): void;
