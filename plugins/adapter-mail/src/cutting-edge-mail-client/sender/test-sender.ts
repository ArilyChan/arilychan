import { Logger } from 'koishi'
import { OutgoingMail } from '../../types'
import { LocalMailAddress } from '../address'
import { BaseSender } from './base-sender'
export class TestSender<T extends never> extends BaseSender<T> {
  logger = new Logger('adapter-mail/debug-client/sender')
  contact: LocalMailAddress = new LocalMailAddress({
    name: 'self',
    address: 'self@koishi.js',
    folders: ['inbox']
  })

  async send (mail: OutgoingMail) {
    this.logger.info(mail)
  }

  async prepare () {
    this.logger.info('ready.')
    this.readyState = true
  }
}
