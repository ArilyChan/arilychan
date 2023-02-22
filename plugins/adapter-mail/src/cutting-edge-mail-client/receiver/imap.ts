import { MailAddress, LocalMailAddress } from '../address'
import { IncomingMail } from '../../types'
import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { AddressObject, EmailAddress, simpleParser } from 'mailparser'
import { promisify } from 'util'

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
      ...option
      // debug: this.logger.extend('verbose').debug
    })
    this.mail = address
  }

  async process () {
    const mails = await this.fetch()
    if (!mails) return
    for (const mail of mails) {
      this.incomingChain(mail)
    }
  }

  async listen () {
    // const getBoxes = promisify<IMAP.MailBoxes>((...args) => this.imap.getBoxes(...args))
    // const boxes = await getBoxes()
    // this.logger.debug('boxes: ' + Object.keys(boxes).join(', '))
    await this.openBox('INBOX')
    await this.process()
    this.logger.debug('listening to new mails')
    this.imap.on('mail', async (numNewMsgs: number) => {
      this.logger.debug(`got ${numNewMsgs} new mail(s)`)
      await this.process()
    })
  }

  async fetch (opt?: IMAP.FetchOptions, search: any[] = ['UNSEEN']) {
    this.logger.debug('fetching messages')
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

        if (!uIds.length) {
          this.logger.debug('nothing to fetch')
          return resolve([])
        }

        this.logger.debug(`receiving ${uIds.length} mail(s)`)
        const fetch = this.imap.fetch(uIds, fetchOptions)
        fetch.once('end', async () => {
          await Promise.all(pMsgReceive)
          this.logger.debug(`received ${mails.length} mails`)
          resolve(mails)
        })
        fetch.on('error', this.logger.error)

        fetch.on('message', (msg, seq) => {
          this.logger.debug(`receiving mail #${seq}`)

          msg.on('body', (stream, info) => {
            // eslint-disable-next-line promise/param-names
            pMsgReceive.push(new Promise<void>((resolve2, reject2) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) reject2(err)

                const to: LocalMailAddress[] = []
                const from: MailAddress[] = []

                if (!parsed.to) reject2(new Error('ParseError: missing <to>'))
                if (!parsed.from) reject2(new Error('ParseError: missing <from>'))

                const iterateTo = addObj => {
                  addObj.value.forEach(addr => to.push(new LocalMailAddress({ name: addr.name, address: addr.address || 'unknown@unknown' })))
                }

                if (Array.isArray(parsed.to)) {
                  parsed.to.forEach(iterateTo)
                } else {
                  iterateTo(parsed.to)
                }

                parsed.from?.value.forEach(mail => from.push(new MailAddress({ name: mail.name, address: mail.address || 'unknown@unknown' })))

                if (from.length > 1) reject2(new Error('more than one sender???'))

                mails.push({
                  // ...parsed,
                  // cc: toAddress(parsed.cc),
                  subject: parsed.subject,
                  to,
                  from: from[0],
                  html: parsed.html || undefined
                })
                resolve2()
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
    return this.retry(0)
  }

  async retry (retries: number = 0) {
    const p = new Promise<void>((resolve, reject) => {
      const onEnd = () => {
        this.logger.info('disconnected')
        this.readyState = false
        if (retries >= 3) reject(new Error('max retries exceed'))
        this.imap.off('ready', onReady)
        this.imap.off('ready', onError)
        this.imap.off('ready', onEnd)
        this.retry(retries + 1).then(resolve)
      }
      const onReady = () => {
        this.logger.info('connected')
        this.readyState = true
        // this.imap.off('error', onError)
        resolve()
        this.listen()
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
    return p
  }
}
