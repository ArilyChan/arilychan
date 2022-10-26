import { BaseSender } from './base-sender'
export { BaseSender } from './base-sender'
export { TestSender } from './test-sender'
export { SMTPSender } from './SMTP'
export type Abstractor<T extends BaseSender> = new (...args) => T
