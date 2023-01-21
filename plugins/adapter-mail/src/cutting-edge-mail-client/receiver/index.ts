import { BaseReceiver } from './base-receiver'
export { IMAPReceiver } from './imap'
export { BaseReceiver } from './base-receiver'
export { TestReceiver } from './test-receiver'
export type Abstractor<T extends BaseReceiver> = new (...args) => T
