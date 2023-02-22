import type { Attachment } from 'nodemailer/lib/mailer'
import { IncomingMail } from '../types'
import { Logger, segment } from 'koishi'
import * as htmlparser2 from 'htmlparser2'

const logger = new Logger('adapter-mail/transform/toMessage')

const resolveAttachment = (url: string, attachments: Attachment[] | undefined) => {
  if (!attachments?.length) return
  if (!url.startsWith('cid:')) {
    return
  }
  const attachment = attachments.find(attachment => attachment.cid === url.slice(4))
  if (!attachment) {
    return
  }
  return attachment.content
}

const extractMessageFromHtml = async ({ html, text, attachments }: IncomingMail): Promise<segment[] | undefined> => {
  const segments: segment[] = []
  let skipInner = false
  const parser = new htmlparser2.Parser({
    onopentag (name: string, attribs: Record<string, string>) {
      skipInner = true
      if (['script', 'style'].includes(name)) {
        return
      }
      if (name === 'img') {
        // TODO: img .src='data:image/{contentType},{encodeType},{encodedContent}'
        const src = attribs.src
        const b64 = resolveAttachment(src, attachments)?.toString('base64')
        skipInner = false
        // return segments.push(s('image', { url: (b64 && `data:image/png;base64, ${b64}`) || src }))
        return segments.push(<image url={(b64 && `data:image/png;base64, ${b64}`) || src}></image>)
      }
      skipInner = false
    },
    ontext (data: string) {
      const trimmed = data.trim()
      if (trimmed !== '') {
        if (skipInner) { return }
        segments.push(segment.text(trimmed))
      }
    }
  })
  html && parser.write(html)
  return (segments.length && segments) || (text && [segment.text(text?.toString('utf-8'))]) || undefined
}
const extractMessage = (mail: IncomingMail) => {
  if (mail.html) {
    return extractMessageFromHtml(mail as IncomingMail)
  } else if (mail.text) return [segment.text(mail.text.toString('utf-8'))] as segment[]
  else return Promise.reject(Error('unable to process message'))
}

const separate = (_separator: string) => async (segs: segment[]) => {
  const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's')
  const returnSegs: segment[] = []
  for (const seg of segs) {
    switch (seg.type) {
      case 'text': {
        const matchResult = (seg.attrs.content as string).match(separator)
        const _before = matchResult ? segment.text(matchResult.groups?.before) : seg
        returnSegs.push(_before)
        if (matchResult) {
          return returnSegs
        }
        continue
      }
      default: {
        logger.info(`unhandled fragment type: ${seg.type}`)
      }
    }
  }

  return returnSegs
}

export function pipeline ({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ }: {separator?: string, messageIdExtractor?: RegExp} = { }) {
  const trimmer = separate(separator)
  return async (mail: IncomingMail) => {
    let id: string | undefined
    const content1 = await extractMessage(mail)

    if (!content1) {
      return
    }

    const content2 = await trimmer(content1)

    const ids = mail.subject ? messageIdExtractor.exec(mail.subject) : undefined
    if (ids) {
      id = ids[1]
    }

    return {
      content: content2,
      id
    }
  }
}
