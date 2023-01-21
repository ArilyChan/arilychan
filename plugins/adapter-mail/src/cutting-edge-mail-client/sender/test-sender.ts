import { Logger } from 'koishi'
import { OutgoingMail } from '../../types'
import { LocalMailAddress } from '../address'
import { BaseSender } from './base-sender'

export type Options = ConstructorParameters<typeof LocalMailAddress>
export class TestSender<T extends never> extends BaseSender<T> {
  logger = new Logger('adapter-mail/debug-client/sender')
  address: LocalMailAddress

  constructor (...opt: Options) {
    super()
    this.address = new LocalMailAddress(...opt)
  }

  async send (mail: OutgoingMail) {
    this.logger.info(mail)
  }

  async prepare () {
    this.logger.info('ready.')
    this.readyState = true
  }
}
