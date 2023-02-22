export type IdType = number;
export declare const idType = "unsigned";
export declare const flags: readonly ["nsfw", "sfw", "disabled", "new"];
export type Flags = typeof flags[number];
declare const courseCompositionTypes: readonly ["appetizer", "soup", "main-dish", "desert"];
export type CourseCompositionType = typeof courseCompositionTypes[number];
interface Base {
    id: IdType;
    name: string;
    assets: string[];
    description: string[];
    flags: Flags[];
}
export interface Section extends Base {
}
export interface Meal extends Base {
    source: {
        user: string;
        channel?: string;
        platform: string;
    };
    sectionId: IdType;
}
export interface Course {
    id: IdType;
    name: string;
    flags: Flags[];
}
export interface CourseItem {
    id: IdType;
    courseId: IdType;
    type: CourseCompositionType;
    mealId: Meal['id'];
}
export interface MealAsset {
    id: IdType;
    file?: string;
    base64?: string;
}
declare module 'koishi' {
    interface Tables {
        section: Section;
        meal: Meal;
        course: Course;
        'course-item': CourseItem;
        'meal-asset': MealAsset;
    }
}
export {};
