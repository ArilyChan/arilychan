import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { MailSubscriber, IncomingMail } from '../../types'

import { LocalMailAddress } from '../address'

export class TestReceiver<T extends never> extends BaseReceiver<T> {
  logger = new Logger('adapter-mail/debug-client/receiver')
  subscribers: Set<MailSubscriber> = new Set()
  address = new LocalMailAddress({
    name: 'self',
    address: 'self@koishi.js',
    folders: ['inbox']
  })

  async fetch () {
    this.logger.info('receiving unread messages')
    return []
  }

  async prepare () {
    this.logger.info('preparing receiver')
  }

  subscribe (subscriber: MailSubscriber) {
    this.subscribers.add(subscriber)
  }

  unsubscribe (subscriber: MailSubscriber) {
    this.subscribers.delete(subscriber)
  }

  async #incomingChain (mail: IncomingMail) {
    const all = []
    for (const subscriber of this.subscribers) {
      all.push(subscriber(mail))
    }
    return await Promise.all(all)
  }

  async _fakeMail (context: Partial<IncomingMail>) {
    if (!context) throw new Error('No context provided')
    const mail: IncomingMail = {
      to: this.address,
      from: new LocalMailAddress({
        name: 'unknown sender',
        address: 'unknown-sender@koishi.js'
      }),
      subject: 'hello',
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: false,
      ...context
    }
    return await this.#incomingChain(mail)
  }
}
