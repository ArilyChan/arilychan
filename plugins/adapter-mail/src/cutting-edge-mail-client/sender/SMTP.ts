import nodemailer from 'nodemailer'
import { OutgoingMail } from '../../types'
import { BaseSender } from './base-sender'
import { LocalMailContact } from '../contact'
type ParamType<T> = T extends (...args: infer P) => any ? P : T
export class SMTPSender extends BaseSender {
  contact: LocalMailContact | LocalMailContact[]
  conn: nodemailer.Transporter
  constructor (...args: ParamType<typeof nodemailer.createTransport>) {
    super()
    this.conn = nodemailer.createTransport(...args)
  }

  async prepare () {
    return await Promise.resolve()
  }

  async send (mail: OutgoingMail) {
    return await Promise.resolve()
  }
}
