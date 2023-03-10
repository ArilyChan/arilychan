import { Context } from 'koishi';
import { Options } from '../';
export declare const name = "osu-info-command-extend-database";
type UserServerBind = Record<string, {
    mode?: string;
    user?: string;
}>;
declare module 'koishi' {
    interface User {
        osu: UserServerBind & {
            defaultServer?: keyof UserServerBind;
        };
    }
}
export declare function apply(ctx: Context, options: Options): void;
export {};
