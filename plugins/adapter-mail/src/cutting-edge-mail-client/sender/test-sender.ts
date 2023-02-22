import { Logger } from 'koishi'
import { OutgoingMail } from '../../types'
import { LocalMailAddress } from '../address'
import { BaseSender } from './base-sender'

export type Options = ConstructorParameters<typeof LocalMailAddress>
export class TestSender<T extends never> extends BaseSender<T> {
  logger = new Logger('adapter-mail/sender/test')
  mail: LocalMailAddress

  constructor (...opt: Options) {
    super()
    this.mail = new LocalMailAddress(...opt)
  }

  async send (mail: OutgoingMail) {
    this.logger.debug(mail)
  }

  async prepare () {
    this.logger.debug('ready.')
    this.readyState = true
  }
}
