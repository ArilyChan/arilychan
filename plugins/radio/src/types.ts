type Brand<T, Brand> = T & {__brand: Brand }

export type UUID = Brand<string, 'uuid'>
export type Guild = Brand<string, 'guild'>

// export interface Uploader {
//   id: string,
//   nickname: string
// }
export type Uploader = Brand<string, 'uploader'>
