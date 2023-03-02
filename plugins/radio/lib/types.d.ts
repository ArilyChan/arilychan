type Brand<T, Brand> = T & {
    __brand: Brand;
};
export type UUID = Brand<string, 'uuid'>;
export type Guild = Brand<string, 'guild'>;
export type Uploader = Brand<string, 'uploader'>;
export {};
