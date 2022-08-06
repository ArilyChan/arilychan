import MailClient from '../cutting-edge-mail-client'
import * as Senders from '../cutting-edge-mail-client/sender'
import * as Receivers from '../cutting-edge-mail-client/receiver'
import { MessageSubscriber, IncomingMail, IncomingMessage } from '../types'
import { segment, Logger } from 'koishi'
import { pipeline as toMessagePipeline } from './toMessage'
import { html } from '../bootleg-html-template'

type Seprator = string | RegExp
export class Bridge {
  client?: MailClient
  subscribers = new Set<MessageSubscriber>()
  logger = new Logger('adapter-mail/bridge')

  #seprator: Seprator = '% reply beyond this line %'
  #toMessagePipeline: ReturnType<typeof toMessagePipeline> = toMessagePipeline({ seprator: this.#seprator })

  get seprator (): Seprator {
    return this.#seprator
  }

  set seprator (value: Seprator) {
    this.#seprator = value
    this.#toMessagePipeline = toMessagePipeline({ seprator: value })
  }

  createClient (mailClientOption) {
    return new MailClient(mailClientOption)
  }

  useClient (mailClient: MailClient) {
    this.client = mailClient
  }

  createSender<T extends Senders.Abstractor<any>> (Sender: T | string, ...args: ConstructorParameters<T>) {
    if (typeof Sender === 'string') {
      return new Senders[Sender](...args)
    }
    return new Sender(...args)
  }

  async useSender (sender: Senders.BaseSender) {
    await this.client?.useSender(sender)
  }

  createReceiver<T extends Receivers.Abstractor<any>> (Receiver: T | string, ...args: ConstructorParameters<T>) {
    if (typeof Receiver === 'string') {
      return new Receivers[Receiver](...args)
    }
    return new Receiver(...args)
  }

  async useReceiver (receiver: Receivers.BaseReceiver) {
    await this.client?.useReceiver(receiver)
  }

  bridge () {
    this.client?.subscribe(this.handleRecievedMail.bind(this))
  }

  subscribe (subscriber: MessageSubscriber) {
    this.subscribers.add(subscriber)
  }

  unsubscribe (subscriber: MessageSubscriber) {
    this.subscribers.delete(subscriber)
  }

  async handleRecievedMail (mail: IncomingMail) {
    try {
      const message = await this.toMessage(mail)
      this.subscribers.forEach(subscriber => subscriber(message))
    } catch (e) {
      this.logger.error(e)
    }
  }

  async toMessage (mail: IncomingMail): Promise<IncomingMessage> {
    const { content, id } = await this.#toMessagePipeline(mail)
    return {
      from: {
        id: mail.from.address,
        name: mail.from.name
      },
      content,
      id
    }
  }

  async sendMessage (to: {id: string}, message: string) {
    const segs = segment.parse(message)
    const h = html`<!DOCTYPE html>
  <html>
    <body>
    ${segs}
    </body>
  </html>
`
    console.log(h)
  }
}

export type BridgeOptions = ConstructorParameters<typeof Bridge>
