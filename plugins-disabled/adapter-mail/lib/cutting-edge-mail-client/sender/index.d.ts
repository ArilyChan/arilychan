import { BaseSender } from './base-sender';
export { BaseSender } from './base-sender';
export { TestSender } from './test-sender';
export { NodeMailer } from './nodemailer';
export type Abstractor<T extends BaseSender> = new (...args: any[]) => T;
