export type IdType = number
export const idType = 'unsigned'

export const flags = ['nsfw', 'sfw', 'disabled', 'new'] as const
export type Flags = typeof flags[number]

const courseCompositionTypes = ['appetizer', 'soup', 'main-dish', 'desert'] as const
export type CourseCompositionTypes = typeof courseCompositionTypes[number]

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
  type: CourseCompositionTypes[],
  mealId: Meal['id']
}

declare module 'koishi' {

  export interface Tables {
    section: Section,
    meal: Meal,
    course: Course,
    'course-item': CourseItem
  }
}
