import { BaseSender } from './base-sender'

export { BaseSender } from './base-sender'
export { TestSender } from './test-sender'
export { NodeMailer } from './node-mailer'

export type Abstractor<T extends BaseSender> = new (...args) => T
