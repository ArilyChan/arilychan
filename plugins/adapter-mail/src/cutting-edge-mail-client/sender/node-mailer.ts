import nodemailer from 'nodemailer'
import { OutgoingMail } from '../../types'
import { BaseSender } from './base-sender'
import { LocalMailAddress } from '../address'
import { htmlToText } from 'nodemailer-html-to-text'
export class NodeMailer extends BaseSender {
  address: LocalMailAddress
  conn: nodemailer.Transporter
  #constructionArgs: Parameters<typeof nodemailer.createTransport>
  constructor (...args: Parameters<typeof nodemailer.createTransport>) {
    super()
    this.#constructionArgs = args
  }

  async prepare () {
    this.conn = nodemailer.createTransport(...this.#constructionArgs)
    this.conn.use('compile', htmlToText({}))
    await this.conn.verify()
  }

  async send (mail: OutgoingMail) {
    if (!this.address && !mail.from) throw new Error('you didn\'t provide a address?')
    if (!mail.html) throw new Error('no content')
    return this.conn.sendMail({
      to: Array.isArray(mail.to) ? mail.to.map(addr => addr.address) : mail.to.address,
      from: (mail.from || this.address).address,
      html: mail.html
    })
  }
}
