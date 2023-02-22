import type { Flags } from '../declares';
import { Context } from 'koishi';
import { Config } from '..';
declare const createScope: (ctx: Context, options: Config) => (disabledFlags?: Flags[], section?: string | number) => Promise<{
    assets: (Pick<import("../declares").MealAsset, import("koishi").Keys<import("../declares").MealAsset, any>> | undefined)[];
    section: true | Pick<import("../declares").Section, import("koishi").Keys<import("../declares").Section, any>> | undefined;
    id: number;
    name: string;
    description: string[];
    flags: ("nsfw" | "sfw" | "disabled" | "new")[];
    sectionId: number;
    source: {
        user: string;
        channel?: string | undefined;
        platform: string;
    };
} | null>;
export default createScope;
export type ReturnValue = ReturnType<ReturnType<typeof createScope>>;
