import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { IncomingMail } from '../../types'

import { LocalMailAddress } from '../address'

export class TestReceiver<T extends never> extends BaseReceiver<T> {
  logger = new Logger('adapter-mail/debug-client/receiver')

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

  async _fakeMail (context: Partial<IncomingMail>) {
    if (!context) throw new Error('No context provided')
    const mail: IncomingMail = {
      to: this.address,
      from: new LocalMailAddress({
        name: 'unknown',
        address: 'unknown-sender@koishi.js'
      }),
      subject: 'hello',
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: false,
      ...context
    }
    return await this.incomingChain(mail)
  }
}
