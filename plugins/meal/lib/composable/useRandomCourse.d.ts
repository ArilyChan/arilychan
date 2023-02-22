import type { Flags } from '../declares';
import { Context } from 'koishi';
import { Config } from '..';
declare const createScope: (ctx: Context, options: Config) => (disabledFlags?: Flags[], section?: string | number) => Promise<{
    compositions: {
        meal: {
            assets: (Pick<import("../declares").MealAsset, import("koishi").Keys<import("../declares").MealAsset, any>> | undefined)[];
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
        } | undefined;
        id: number;
        courseId: number;
        type: "appetizer" | "soup" | "main-dish" | "desert";
        mealId: number;
    }[];
    id: number;
    name: string;
    flags: ("nsfw" | "sfw" | "disabled" | "new")[];
} | null>;
export default createScope;
export type ReturnValue = ReturnType<ReturnType<typeof createScope>>;
