export type IdType = number
export const idType = 'unsigned'

export const flags = ['nsfw', 'sfw', 'disabled', 'new'] as const
export type Flags = typeof flags[number]

const courseCompositionTypes = ['appetizer', 'soup', 'main-dish', 'desert'] as const
export type CourseCompositionType = typeof courseCompositionTypes[number]

interface Base {
  id: IdType,
  name: string,
  assets: string[],
  description: string[],
  flags: Flags[]
}

export interface Section extends Base {
}

export interface Meal extends Base{
  source: {
    user: string,
    channel?: string
    platform: string
  }
  sectionId: IdType
}

export interface Course {
  id: IdType,
  name: string,
  flags: Flags[]
}

export interface CourseItem {
  id: IdType,
  courseId: IdType,
  type: CourseCompositionType,
  mealId: Meal['id']
}

export interface MealAsset {
  id: IdType,
  file?: string,
  base64?: string
}

declare module 'koishi' {

  export interface Tables {
    section: Section,
    meal: Meal,
    course: Course,
    'course-item': CourseItem,
    'meal-asset': MealAsset
  }
}
