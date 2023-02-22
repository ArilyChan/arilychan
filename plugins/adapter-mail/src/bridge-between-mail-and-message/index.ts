import { LocalMailAddress, MailAddress } from '../cutting-edge-mail-client/address'
import MailClient from '../cutting-edge-mail-client'
import * as Senders from '../cutting-edge-mail-client/sender'
import * as Receivers from '../cutting-edge-mail-client/receiver'
import { MessageSubscriber, IncomingMail, ReceivedMessage } from '../types'
import { Logger, Fragment } from 'koishi'
import { pipeline as toMessagePipeline } from './toMessage'
import { html } from '../bootleg-html-template'

type Separator = string;
export class Bridge {
  client: MailClient
  subscribers = new Set<MessageSubscriber>()
  logger = new Logger('adapter-mail/bridge')

  #separator: Separator = '% reply before this line %'
  #toMessagePipeline: ReturnType<typeof toMessagePipeline> = toMessagePipeline({
    separator: this.#separator
  })

  get separator (): Separator {
    return this.#separator
  }

  set separator (value: Separator) {
    this.#separator = value
    this.#toMessagePipeline = toMessagePipeline({ separator: value })
  }

  useClient (mailClient: MailClient) {
    this.client = mailClient
  }

  async useSender (sender: Senders.BaseSender) {
    await this.client?.useSender(sender)
  }

  async useReceiver (receiver: Receivers.BaseReceiver) {
    await this.client?.useReceiver(receiver)
  }

  bridge () {
    this.client?.subscribe((arg) => this.handleReceivedMail(arg))
  }

  subscribe (subscriber: MessageSubscriber) {
    this.subscribers.add(subscriber)
  }

  unsubscribe (subscriber: MessageSubscriber) {
    this.subscribers.delete(subscriber)
  }

  async handleReceivedMail (mail: IncomingMail) {
    try {
      const message = await this.toMessage(mail)
      if (!message) return
      this.subscribers.forEach((subscriber) => subscriber(message))
    } catch (e) {
      this.logger.error(e)
    }
  }

  async toMessage (mail: IncomingMail): Promise<ReceivedMessage | undefined> {
    const result = await this.#toMessagePipeline(mail)

    if (!result) {
      return
    }

    const { content: elements, id } = result
    return {
      from: {
        id: mail.from.address,
        name: mail.from.name
      },
      elements,
      id
    }
  }

  async sendMessage ({ to, from, content }: { to: { id: string; name?: string}, from: { id: string, name?: string }; content: Fragment }) {
    const messageId = (Math.random() * 114514 * 1919810).toFixed()
    // const segs = segment.parse(content)
    const h = html`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            p {
              white-space: pre;
            }
          </style>
        </head>
        <body>
          <p>${this.#separator}</p>
          <section class="bot-reply-container">${content}</section>
        </body>
      </html>
    `
    this.client.send({
      to: new MailAddress({ address: to.id, name: to.name }),
      from: new LocalMailAddress({ address: from.id, name: from.name }),
      html: h,
      subject: `#k-id=${messageId}#`,
      messageId
    })
  }
}

export type BridgeOptions = ConstructorParameters<typeof Bridge>;
