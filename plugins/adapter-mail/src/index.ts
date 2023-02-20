import { Context, Schema } from 'koishi'
import { Config, MailBot } from './adapter'

const { union, object, string, const: literal, natural, boolean, intersect } = Schema

const TestEntry = literal('test').description('test purpose only')
const NodemailerEntry = literal('node-mailer-smtp').description('nodemailer createTransport smtp')
const IMAPEntry = literal('imap').description('IMAP transport w/ node-imap')
const Port = natural().max(65535)

// const testConfig = object({
//   name: string(),
//   address: string()
// })

export const schema = intersect([
  object({
    name: string(),
    address: string().required().role('email')
  }),
  object({
    // address: dict(string(), string()).description('name - address pair'),
    sender: union([
      TestEntry,
      NodemailerEntry
    ]).description('send protocol').role('radio'),
    receiver: union([
      TestEntry,
      IMAPEntry
    ]).description('send protocol').role('radio')
  }),

  union([
    object({
      sender: TestEntry.required()
    }),
    object({
      sender: NodemailerEntry.required(),
      senderConfig: object({
        host: string(),
        port: Port.default(465),
        secure: boolean().default(true),
        auth: object({
          user: string(),
          pass: string().role('secret')
        })
      })
    })
  ]).description('sender opt'),

  union([
    object({
      receiver: TestEntry
    }),
    object({
      receiver: IMAPEntry,
      receiverConfig: object({
        user: string(),
        password: string().role('secret'),
        host: string(),
        port: Port.default(993),
        tls: boolean().default(true)
      })
    })
  ]).description('receiver opt')
])

export type Options = {
  address: string,
  name: string
} & (
  | {
    sender: 'test',
  }
  | {
    sender: 'node-mailer-smtp',
    senderConfig: {
      host: string,
      port: number,
      secure: boolean,
      auth: {
        user: string,
        pass: string
      }
    }
  }
) & (
    | {
      receiver: 'test',
      receiverConfig: {
        name: string,
        address: string
      }
    }
    | {
      receiver: 'imap',
      receiverConfig: {
        user: string,
        password: string
      }
    }
  )

export const name = 'adapter-mail'
export function apply (ctx: Context, config: Config) {
  ctx.plugin(MailBot, config)
}
