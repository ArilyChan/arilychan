import nodemailer from 'nodemailer'
import { OutgoingMail } from '../../types'
import { BaseSender } from './base-sender'
import { LocalMailAddress } from '../address'
type ParamType<T> = T extends (...args: infer P) => any ? P : T
export class SMTPSender extends BaseSender {
  address: LocalMailAddress
  conn: nodemailer.Transporter
  #constructionArgs: ParamType<typeof nodemailer.createTransport>
  constructor (...args: ParamType<typeof nodemailer.createTransport>) {
    super()
    this.#constructionArgs = args
  }

  async prepare () {
    this.conn = nodemailer.createTransport(...this.#constructionArgs)
    await this.conn.verify()
  }

  async send (mail: OutgoingMail) {
    if (!this.address) throw new Error('what\'s your address?')
    return await Promise.resolve()
  }
}
