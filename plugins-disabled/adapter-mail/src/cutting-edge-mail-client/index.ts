import type { MailSubscriber, OutgoingMail, LocalMailAddressInterface } from '../types'
import type { BaseSender } from './sender/base-sender'
import type { BaseReceiver } from './receiver/base-receiver'
import { Logger } from 'koishi'
export default class MailClient {
  senders = new Map<LocalMailAddressInterface, BaseSender>()
  receivers = new Map<LocalMailAddressInterface, BaseReceiver>()
  logger = new Logger('adapter-mail/client')
  options: {
    receiver: {
      fetchOnUse: boolean
    }
  }

  async useSender<T extends BaseSender> (sender: T): Promise<any> {
    if (!Array.isArray(sender.mail)) {
      if (this.senders.has(sender.mail)) return
      this.senders.set(sender.mail, sender)
    } else {
      sender.mail.forEach(c => {
        if (this.senders.has(c)) return
        this.senders.set(c, sender)
      })
    }
    if (!sender.readyState) return await sender.prepare()
  }

  // TODO: unuseSender

  async useReceiver<T extends BaseReceiver> (receiver: T): Promise<any> {
    if (!Array.isArray(receiver.mail)) {
      if (this.receivers.has(receiver.mail)) return
      this.receivers.set(receiver.mail, receiver)
    } else {
      receiver.mail.forEach(c => {
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

  async send (mail: Partial<OutgoingMail> & Pick<OutgoingMail, 'to'>, sender?: BaseSender) {
    if (!mail.to) { return this.logger.error('Cannot send mail. missing `to`.') }
    if (!mail.from && !sender) { return this.logger.error('Cannot send mail. missing sender.') }
    sender = sender ?? (mail.from && this.findSender(mail.from))
    if (!sender) {
      this.logger.error('Cannot send mail, cannot find sender.')
      console.trace()
      return
    }
    mail.from = mail.from ?? sender.mail
    if (!mail.from) {
      this.logger.error('Cannot send mail, cannot find correlated mail address.')
      console.trace()
      return
    }
    return await sender.send(mail as OutgoingMail)
  }

  findSender (IAddress: LocalMailAddressInterface): BaseSender | undefined {
    return (IAddress.local && this.senders.get(IAddress)) ??
    ([...this.senders.entries()].find(([c]) => c.address === IAddress.address)?.[1])
  }
}
