import { MailSubscriber, OutgoingMail, LocalMailAddressInterface } from '../types'
import { BaseSender } from './sender/base-sender'
import { BaseReceiver } from './receiver/base-receiver'
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
    if (!Array.isArray(sender.address)) {
      if (this.senders.has(sender.address)) return
      this.senders.set(sender.address, sender)
    } else {
      sender.address.forEach(c => {
        if (this.senders.has(c)) return
        this.senders.set(c, sender)
      })
    }
    if (!sender.readyState) return await sender.prepare()
  }

  // TODO: unuseSender

  async useReceiver<T extends BaseReceiver> (receiver: T): Promise<any> {
    if (!Array.isArray(receiver.address)) {
      if (this.receivers.has(receiver.address)) return
      this.receivers.set(receiver.address, receiver)
    } else {
      receiver.address.forEach(c => {
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
    mail.from = mail.from ?? sender.address
    if (!sender || !mail.from) { return this.logger.error('Cannot send mail, cannot find sender.') }
    return await sender.send(mail as OutgoingMail)
  }

  findSender (address: LocalMailAddressInterface): BaseSender {
    return (address.local && this.senders.get(address)) ??
    ([...this.senders.entries()].find(([c]) => c === address)[1])
  }
}
