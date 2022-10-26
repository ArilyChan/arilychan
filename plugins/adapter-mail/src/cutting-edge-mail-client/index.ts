import { MailSubscriber, OutgoingMail, LocalMailContactInterface } from '../types'
import { BaseSender } from './sender/base-sender'
import { BaseReceiver } from './receiver/base-receiver'
import { Logger } from 'koishi'
export default class MailClient {
  senders = new Map<LocalMailContactInterface, BaseSender>()
  receivers = new Map<LocalMailContactInterface, BaseReceiver>()
  logger = new Logger('adapter-mail/client')
  options: {
    receiver: {
      fetchOnUse: boolean
    }
  }

  constructor (options) {
    this.options = options
  }

  async useSender<T extends BaseSender> (sender: T): Promise<any> {
    if (!Array.isArray(sender.contact)) {
      if (this.senders.has(sender.contact)) return
      this.senders.set(sender.contact, sender)
    } else {
      sender.contact.forEach(c => {
        if (this.senders.has(c)) return
        this.senders.set(c, sender)
      })
    }
    if (!sender.readyState) return await sender.prepare()
  }

  // TODO: unuseSender

  async useReceiver<T extends BaseReceiver> (receiver: T): Promise<any> {
    if (!Array.isArray(receiver.contact)) {
      if (this.receivers.has(receiver.contact)) return
      this.receivers.set(receiver.contact, receiver)
    } else {
      receiver.contact.forEach(c => {
        if (this.receivers.has(c)) return
        this.receivers.set(c, receiver)
      })
    }
    if (!receiver.readyState) return await receiver.prepare()
  }

  // TODO: unuseReceiver

  subscribe (subscriber: MailSubscriber) {
    this.receivers.forEach(receivers => receivers.subscribe(subscriber))
  }

  unsubscribe (subscriber: MailSubscriber) {
    this.receivers.forEach(receivers => receivers.unsubscribe(subscriber))
  }

  async send<T extends BaseSender> (mail: Partial<OutgoingMail> & Pick<OutgoingMail, 'to'>, sender?: T) {
    if (!mail.to) { return this.logger.error('Cannot send mail. missing `to`.') }
    if (!mail.from && !sender) { return this.logger.error('Cannot send mail. missing sender.') }
    sender = sender ?? this.findSender(mail.from) as T
    mail.from = mail.from ?? sender.contact
    if (!sender || !mail.from) { return this.logger.error('Cannot send mail, cannot find sender.') }
    return await sender.send(mail as OutgoingMail)
  }

  findSender (contact: LocalMailContactInterface): BaseSender {
    return (contact.local && this.senders.get(contact)) ??
    ([...this.senders.entries()].find(([c]) => c === contact)[1])
  }
}
