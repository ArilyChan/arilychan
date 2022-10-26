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

const abstractMessageFromHtml = async ({ html, attachments }: IncomingMail) => {
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
        return segments.push(s('image', { url: (b64 && `base64://${b64}`) || src }))
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
const abstractMessage = (mail: IncomingMail) => {
  if (mail.html) {
    return abstractMessageFromHtml(mail as IncomingMail & {html: string})
  } else if (mail.text) return mail.text
  else return Promise.reject(Error('unable to process message'))
}

type Seprator = string | RegExp
const seprate = (seprator: Seprator, idTemplate: RegExp) => async (text: string) => {
  let content
  const endsAt = text.match(seprator)?.index
  if (endsAt) content = text.slice(0, endsAt)
  else content = text
  text = text.slice(endsAt)
  const ids = idTemplate.exec(text)
  if (ids) content = content.replace(idTemplate, '')
  return { content, id: ids?.[1] }
}

export function pipeline ({ seprator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ }: {seprator?: Seprator, messageIdExtractor?: RegExp} = { }) {
  return async (mail: IncomingMail) => {
    const { content, id } = await Promise.resolve(mail).then(abstractMessage).then(seprate(seprator, messageIdExtractor))
    return { content, id }
  }
}
