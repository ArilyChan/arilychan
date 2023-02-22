import { Context, Schema } from 'koishi';
import { Config } from '..';
export declare const name = "meal-commands";
export declare const schema: Schema<Config>;
export declare function apply(ctx: Context, options: Config): void;
