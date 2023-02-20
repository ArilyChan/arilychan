import { MailAddress, LocalMailAddress } from '../address'
import { IncomingMail } from '../../types'
import { Logger } from 'koishi'
import { BaseReceiver } from './base-receiver'
import { simpleParser } from 'mailparser'

import IMAP from 'node-imap'

export class IMAPReceiver<T extends never> extends BaseReceiver<T> {
  logger = new Logger('adapter-mail/debug-client/receiver/imap')
  imap: IMAP
  mail: LocalMailAddress
  interval: ReturnType<typeof setInterval>

  constructor (option: ConstructorParameters<typeof IMAP>[0]) {
    super()
    this.imap = new IMAP(option)
    this.mail = new LocalMailAddress({
      address: option.user
    })
  }

  async fetch () {
    this.logger.info('receiving unread messages')
    const mails: IncomingMail[] = []
    return new Promise<IncomingMail[]>((resolve, reject) => {
      this.imap.search(['UNSEEN'], (err, uIds) => {
        if (err) reject(err)
        const fetch = this.imap.fetch(uIds, { markSeen: true })
        fetch.on('error', this.logger.error)
        fetch.on('message', (msg, seq) => {
          msg.on('body', async (stream, info) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) reject(err)

              const to: LocalMailAddress[] = []
              const from: MailAddress<false>[] = []

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
                ...parsed,
                to,
                from: from[0]
              })
            })
          })
        })
        fetch.once('end', () => resolve(mails))
      })
    })
  }

  async listen () {
    this.interval = setInterval(this.fetch.bind(this), 5000)
  }

  async stop () {
    clearInterval(this.interval)
  }

  async prepare () {
    const pPrepare = new Promise<void>((resolve, reject) => {
      const onReady = () => {
        this.readyState = true
        resolve()
      }
      const onEnd = () => {
        this.imap.off('ready', onReady)
        this.imap.off('end', onEnd)
        this.readyState = false
      }
      this.imap.on('ready', onReady)
      this.imap.on('end', onEnd)
    })
    return pPrepare
  }
}
