import { Logger } from 'koishi'
import { IncomingMail, MailSubscriber } from '../../types'
import { LocalMailAddress } from '../address'
import { BaseIO } from '../base'
type GetElementType<T extends any[]> = T extends Array<infer U> ? U : never
export abstract class BaseReceiver<T = any> extends BaseIO {
  abstract logger: Logger
  subscribers: Set<MailSubscriber> = new Set()
  abstract fetch (inbox?: LocalMailAddress['folders'] | GetElementType<LocalMailAddress['folders']>): Promise<IncomingMail[]>
  abstract prepare (withConnection?: T): Promise<void>
  subscribe (subscriber: MailSubscriber) {
    this.subscribers.add(subscriber)
  }

  unsubscribe (subscriber: MailSubscriber) {
    this.subscribers.delete(subscriber)
  }

  async receivedMail (mail: IncomingMail) {
    // this.logger.debug(`handling mail: ${mail}`)
    const all = <any[]>[]
    for (const subscriber of this.subscribers) {
      all.push(subscriber(mail))
    }
    await Promise.all(all)
  }
}
