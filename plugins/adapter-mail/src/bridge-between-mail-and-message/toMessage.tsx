import type { Attachment } from 'nodemailer/lib/mailer'
import { IncomingMail } from '../types'
import { Logger, segment } from 'koishi'
import * as htmlparser2 from 'htmlparser2'

// const logger = new Logger('adapter-mail/transform/toMessage')

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

// TODO maybe fix this?
const separate = (_separator: string, idTemplate: RegExp) => async (text: segment[]) => {
  // return text.reduce<Fragment[]>((acc, fragment) => {
  //
  //

  //   fragment = matchResult ? matchResult.groups?.before || '' + matchResult.groups?.after : fragment
  //   const ids = idTemplate.exec(fragment)
  //   if (ids) fragment = fragment.replace(idTemplate, '')
  //   return acc
  // }, [])
  const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's')
  const before: segment[] = []
  // const after: segment[] = []
  for (const fragment of text) {
    switch (fragment.type) {
      case 'text': {
        const matchResult = fragment.attrs.content.match(separator)
        const _before = matchResult ? segment.text(matchResult.groups?.before) : fragment
        before.push(_before)
        break
      }
      default: {
        new Logger('adapter-mail/toMessage').debug(`unhandled fragment type: ${fragment.type}`)
      }
    }
  }

  return {
    content: before,
    id: 1
  }
}

export function pipeline ({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ }: {separator?: string, messageIdExtractor?: RegExp} = { }) {
  return async (mail: IncomingMail) => {
    // logger.debug(mail.html)
    // logger.debug(mail.text)

    let id: string | undefined
    const content1 = await extractMessage(mail)

    if (!content1) {
      return
    }

    const ids = mail.subject ? messageIdExtractor.exec(mail.subject) : undefined
    if (ids) {
      id = ids[1]
    }

    return {
      content: content1,
      id
    }
    // const { content, id } = await separate(separator, messageIdExtractor)(content1)
    // return { content, id }
  }
}
