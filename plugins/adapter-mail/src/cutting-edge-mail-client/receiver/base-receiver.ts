import { IncomingMail, MailSubscriber } from '../../types'
import { LocalMailAddress } from '../address'
import { BaseIO } from '../base'
type GetElementType<T extends any[]> = T extends Array<infer U> ? U : never
export abstract class BaseReceiver<T = any> extends BaseIO {
  subscribers: Set<MailSubscriber> = new Set()
  abstract fetch (inbox?: LocalMailAddress['folders'] | GetElementType<LocalMailAddress['folders']>): Promise<IncomingMail[]>
  abstract prepare (withConnection?: T): Promise<void>
  subscribe (subscriber: MailSubscriber) {
    this.subscribers.add(subscriber)
  }

  unsubscribe (subscriber: MailSubscriber) {
    this.subscribers.delete(subscriber)
  }

  async incomingChain (mail: IncomingMail) {
    const all = []
    for (const subscriber of this.subscribers) {
      all.push(subscriber(mail))
    }
    return await Promise.all(all)
  }
}
