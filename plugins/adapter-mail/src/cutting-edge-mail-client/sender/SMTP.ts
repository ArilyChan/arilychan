import nodemailer from 'nodemailer'
import { OutgoingMail } from '../../types'
import { BaseSender } from './base-sender'
import { LocalMailAddress } from '../address'
type ParamType<T> = T extends (...args: infer P) => any ? P : T
export class SMTPSender extends BaseSender {
  contact = new Map<string, LocalMailAddress>()
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
    if (!this.contact.has(mail.from.address)) throw new Error('not a')
    return await Promise.resolve()
  }
}
