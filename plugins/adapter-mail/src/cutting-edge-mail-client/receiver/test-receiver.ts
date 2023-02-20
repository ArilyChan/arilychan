import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { IncomingMail } from '../../types'

import { LocalMailAddress, MailAddress } from '../address'

export type Options = ConstructorParameters<typeof LocalMailAddress>
export class TestReceiver<T extends never> extends BaseReceiver<T> {
  logger = new Logger('adapter-mail/receiver')

  mail: LocalMailAddress

  constructor (...opt: Options) {
    super()
    this.mail = new LocalMailAddress(...opt)
  }

  async fetch () {
    this.logger.debug('receiving unread messages')
    return new Promise<IncomingMail[]>((resolve, reject) => {
      setTimeout(() => resolve([this.createFakeMail({
        html: 'test message'
      })]), 2000)
    })
  }

  async prepare () {
    this.logger.debug('preparing receiver')
  }

  async _fakeMail (context: Partial<IncomingMail>) {
    const mail = this.createFakeMail(context)
    return await this.incomingChain(mail)
  }

  createFakeMail (context: Partial<IncomingMail>) {
    if (!context) throw new Error('No context provided')
    const mail: IncomingMail = {
      to: this.mail,
      from: new MailAddress({
        name: 'unknown',
        address: 'unknown-sender@koishi.js'
      }),
      subject: 'hello',
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: '',
      ...context
    }
    return mail
  }
}
