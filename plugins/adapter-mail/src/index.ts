import { Context, Schema } from 'koishi'
import { Config, MailBot } from './adapter'

const { union, object, string, const: literal, number, boolean, intersect } = Schema

const testEntry = literal('test').description('test purpose only')
const nodemailerEntry = literal('node-mailer-smtp').description('nodemailer createTransport smtp')
const IMAPEntry = literal('imap').description('IMAP transport w/ node-imap')

const testConfig = object({
  name: string(),
  address: string()
})

export const schema = intersect([
  object({
    sender: union([
      testEntry,
      nodemailerEntry
    ]).description('send protocol'),
    receiver: union([
      testEntry,
      IMAPEntry
    ]).description('send protocol')
  }),

  union([
    object({
      sender: testEntry.required(),
      senderConfig: testConfig
    }),
    object({
      sender: nodemailerEntry.required(),
      senderConfig: object({
        address: string(),
        host: string(),
        port: number(),
        secure: boolean(),
        auth: object({
          user: string(),
          pass: string()
        })
      })
    })
  ]).description('sender opt'),

  union([
    object({
      receiver: testEntry,
      receiverConfig: testConfig
    }),
    object({
      receiver: IMAPEntry,
      receiverConfig: object({
        test1: string()
      })
    })
  ]).description('receiver opt')
])

export const name = 'adapter-mail'
export function apply (ctx: Context, config: Config) {
  ctx.plugin(MailBot, config)
}
