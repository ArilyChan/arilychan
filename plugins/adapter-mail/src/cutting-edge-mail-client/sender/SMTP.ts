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
    if (!this.address && !mail.from) throw new Error('you didn\'t provide a address?')
    if (!mail.html) throw new Error('no content')
    return this.conn.sendMail({
      to: mail.to,
      from: mail.from || this.address,
      html: mail.html
    })
  }
}
