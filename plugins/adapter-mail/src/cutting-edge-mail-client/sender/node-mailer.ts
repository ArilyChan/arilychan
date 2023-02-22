import nodemailer from 'nodemailer'
import { OutgoingMail } from '../../types'
import { BaseSender } from './base-sender'
import { LocalMailAddress } from '../address'
// import { htmlToText } from 'nodemailer-html-to-text'
import { Logger } from 'koishi'

type SMTPConfig = {
  host: string,
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}
export class NodeMailer extends BaseSender {
  logger = new Logger('adapter-mail/sender/nodemailer')
  mail: LocalMailAddress
  conn: nodemailer.Transporter
  #constructionArg: SMTPConfig
  constructor (arg: SMTPConfig, address: LocalMailAddress) {
    super()
    this.#constructionArg = arg
    this.mail = address
  }

  async prepare () {
    this.conn = nodemailer.createTransport({
      ...this.#constructionArg
    })
    // this.conn.use('compile', htmlToText({}))
    await this.conn.verify()
    this.logger.info('ready')
  }

  async send (mail: OutgoingMail) {
    if (!this.mail && !mail.from) throw new Error('you didn\'t provide an address?')
    if (!mail.html) throw new Error('no content')
    console.trace()
    return this.conn.sendMail({
      ...mail,

      to: Array.isArray(mail.to) ? mail.to.map(addr => addr.address) : mail.to.address,
      from: (mail.from || this.mail).address,
      html: mail.html
    })
  }
}
