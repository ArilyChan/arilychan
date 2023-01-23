import type { Attachment } from 'mailparser'
import { IncomingMail } from '../types'
import { segment as s } from 'koishi'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const htmlparser2 = require('htmlparser2')

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

const extractMessageFromHtml = async ({ html, attachments }: IncomingMail) => {
  const segments = []
  let skip = false
  const parser = new htmlparser2.Parser({
    onopentag (name, attribs, isImplied) {
      skip = true
      if (['script', 'style'].includes(name)) {
        return
      }
      if (name === 'img') {
        // TODO: img .src='data:image/{contentType},{encodeType},{encodedContent}'
        const src = attribs.src
        const b64 = resolveAttachment(src, attachments)?.toString('base64')
        skip = false
        return segments.push(s('image', { url: (b64 && `data:image/png;base64, ${b64}`) || src }))
      }
      skip = false
    },
    ontext (data) {
      const trimmed = data.trim()
      if (trimmed !== '') {
        if (skip) { return }
        segments.push(s('text', { content: trimmed }))
      }
    }
  })
  parser.write(html)
  return segments.join('\n')
}
const extractMessage = (mail: IncomingMail) => {
  if (mail.html) {
    return extractMessageFromHtml(mail as IncomingMail & {html: string})
  } else if (mail.text) return mail.text
  else return Promise.reject(Error('unable to process message'))
}

const separate = (_separator: string, idTemplate: RegExp) => async (text: string) => {
  let content
  const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's')
  const matchResult = text.match(separator)

  content = matchResult ? matchResult.groups.before + matchResult.groups.after : text
  const ids = idTemplate.exec(content)
  if (ids) content = content.replace(idTemplate, '')
  return { content, id: ids?.[1] }
}

export function pipeline ({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ }: {separator?: string, messageIdExtractor?: RegExp} = { }) {
  return async (mail: IncomingMail) => {
    const { content, id } = await Promise.resolve(mail).then(extractMessage).then(separate(separator, messageIdExtractor))
    return { content, id }
  }
}
