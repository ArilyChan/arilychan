import type { Attachment } from 'mailparser'
import { IncomingMail } from '../types'
import { Logger, segment as s } from 'koishi'
import * as htmlparser2 from 'htmlparser2'

const resolveAttachment = (url: string, attachments: Attachment[]): Buffer | undefined => {
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

const extractMessageFromHtml = async ({ html, text, attachments }: IncomingMail) => {
  const segments: s[] = []
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
        segments.push(<>{trimmed}</>)
      }
    }
  })
  html && parser.write(html)
  return segments.join('\n') || text
}
const extractMessage = (mail: IncomingMail) => {
  if (mail.html) {
    return extractMessageFromHtml(mail as IncomingMail)
  } else if (mail.text) return mail.text
  else return Promise.reject(Error('unable to process message'))
}

const separate = (_separator: string, idTemplate: RegExp) => async (text: string) => {
  const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's')
  const matchResult = text.match(separator)

  text = matchResult ? matchResult.groups?.before || '' + matchResult.groups?.after : text
  const ids = idTemplate.exec(text)
  if (ids) text = text.replace(idTemplate, '')
  return { content: text, id: ids?.[1] }
}

export function pipeline ({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ }: {separator?: string, messageIdExtractor?: RegExp} = { }) {
  return async (mail: IncomingMail) => {
    new Logger('adapter-mail/transform/toMessage').debug(mail.html)
    new Logger('adapter-mail/transform/toMessage').debug(mail.text)
    const content1 = await extractMessage(mail)

    if (!content1) return

    const { content, id } = await separate(separator, messageIdExtractor)(content1)
    return { content, id }
  }
}
