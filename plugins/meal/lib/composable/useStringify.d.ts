import { Context } from 'koishi';
import { Config } from '..';
import { CourseCompositionType, MealAsset } from '../declares';
import { ReturnValue as ReturnedCourse } from './useRandomCourse';
import { ReturnValue as ReturnedMeal } from './useRandomMeal';
export declare const courseType: Record<CourseCompositionType, string>;
export declare const renderMealDescription: (stringTemplate: string[], assets: Array<MealAsset | undefined>) => string;
export type StringifyType = 'element' | 'string';
declare const _default: (ctx: Context, options: Config) => (as: StringifyType) => {
    meal(m: Awaited<ReturnedMeal>): string;
    course(c: Awaited<ReturnedCourse>): string;
} | undefined;
export default _default;
