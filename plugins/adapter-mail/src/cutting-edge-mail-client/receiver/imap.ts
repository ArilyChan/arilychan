import { MailAddress, LocalMailAddress } from '../address'
import { IncomingMail } from '../../types'
import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { AddressObject, EmailAddress, simpleParser } from 'mailparser'

import IMAP from 'node-imap'

function toAddress (addr: AddressObject | AddressObject[]): EmailAddress[] | undefined {
  if (Array.isArray(addr)) {
    const addrs = addr.map(toAddress)
    const flat = addrs.flat().filter(a => a) as EmailAddress[]
    return flat.length > 0 ? flat : undefined
  }
  return addr.value.length > 0 ? addr.value : undefined
}
export class IMAPReceiver<T extends never> extends BaseReceiver<T> {
  logger = new Logger('adapter-mail/receiver/imap')
  imap: IMAP
  mail: LocalMailAddress
  interval: ReturnType<typeof setInterval>

  constructor (option: ConstructorParameters<typeof IMAP>[0], address: LocalMailAddress) {
    super()
    this.imap = new IMAP({
      keepalive: true,
      ...option,
      debug: (v) => this.logger.debug(v)
    })
    this.mail = address
  }

  async process () {
    const mails = await this.fetch()
    for (const mail of mails) {
      await this.incomingChain(mail)
    }
  }

  async listen () {
    this.logger.debug('listening to new mails')
    await this.openBox('INBOX')
    await this.process()
    this.imap.on('mail', async (numNewMsgs: number) => {
      this.logger.debug(`receiving ${numNewMsgs} new message(s)`)
      await this.process()
    })
  }

  async fetch (opt?: IMAP.FetchOptions, search: any[] = ['NEW']) {
    this.logger.debug('receiving unread messages')
    const fetchOptions = opt || {
      bodies: '',
      markSeen: true
    }
    // const { box, close } = await this.openBox('INBOX')
    const mails: IncomingMail[] = []
    const pMsgReceive: Promise<any>[] = []
    return new Promise<IncomingMail[]>((resolve, reject) => {
      this.imap.search(search, (err, uIds) => {
        if (err) reject(err)
        if (!uIds.length) return this.logger.debug('nothing to fetch')
        this.logger.debug(`receiving ${uIds.length} mail(s)`)
        const fetch = this.imap.fetch(uIds, fetchOptions)
        fetch.once('end', async () => {
          this.logger.debug(`received ${mails.length} mails`)
          await Promise.all(pMsgReceive)
          resolve(mails)
        })
        fetch.on('error', this.logger.error)
        fetch.on('message', (msg, seq) => {
          this.logger.debug(`receiving mail #${seq}`)
          msg.on('body', (stream, info) => {
            pMsgReceive.push(new Promise<void>((resolve, reject) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) reject(err)

                const to: LocalMailAddress[] = []
                const from: MailAddress[] = []

                if (!parsed.to) reject(new Error('ParseError: <to> missing'))
                if (!parsed.from) reject(new Error('ParseError: <from> missing'))

                const iterateTo = addObj => {
                  addObj.value.forEach(addr => to.push(new LocalMailAddress({ name: addr.name, address: addr.address || 'unknown@unknown' })))
                }

                if (Array.isArray(parsed.to)) {
                  parsed.to.forEach(iterateTo)
                } else {
                  iterateTo(parsed.to)
                }

                parsed.from?.value.forEach(mail => from.push(new MailAddress({ name: mail.name, address: mail.address || 'unknown@unknown' })))

                if (from.length > 1) reject(new Error('more than one sender???'))

                mails.push({
                  // ...parsed,
                  // cc: toAddress(parsed.cc),
                  subject: parsed.subject,
                  to,
                  from: from[0],
                  html: parsed.html || undefined
                })
                resolve()
              })
            }))
          })
        })
      })
    })
  }

  async openBox (mailboxName: string) {
    this.logger.debug(`opening box: ${mailboxName}`)
    return await new Promise<{ box: IMAP.Box, close:() => PromiseLike<void> }>
      // eslint-disable-next-line no-extra-parens
      ((resolve, reject) => {
        return this.imap.openBox(mailboxName, false, (err, box) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              box,
              close: () => new Promise((resolve, reject) => this.imap.closeBox((err) => err ? reject(err) : resolve()))
            })
          }
        })
      })
  }

  async stop () {
    clearInterval(this.interval)
  }

  async prepare () {
    this.logger.debug('connecting to imap server')
    const p = new Promise<void>((resolve, reject) => {
      const onEnd = (...args) => {
        this.logger.info('disconnected')
        this.readyState = false
      }
      const onReady = () => {
        this.logger.info('connected')
        this.readyState = true
        this.imap.off('error', onError)
        resolve()
      }
      const onError = (err) => {
        this.logger.error(err)
        onEnd()
        reject(err)
      }
      this.imap.once('ready', onReady)
      this.imap.once('error', onError)
      this.imap.once('end', onEnd)
      this.imap.connect()
    })
    p.then(this.listen.bind(this))
    return p
  }
}
