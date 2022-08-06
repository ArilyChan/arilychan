import { IncomingMail, MailSubscriber } from '../../types'
import { LocalMailContact } from '../contact'
import { BaseIO } from '../base'
type GetElementType<T extends any[]> = T extends Array<infer U> ? U : never
export abstract class BaseReceiver<T = any> extends BaseIO {
  abstract fetch (inbox?: LocalMailContact['folders'] | GetElementType<LocalMailContact['folders']>): Promise<IncomingMail[]>
  abstract prepare (withConnection?: T): Promise<void>
  abstract subscribe (subscriber: MailSubscriber): void
  abstract unsubscribe (subscriber: MailSubscriber): void
}
