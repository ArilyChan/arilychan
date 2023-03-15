import { Context, Schema } from 'koishi'
import { Config, MailBot } from './adapter'

const { union, object, string, const: literal, natural, boolean, intersect } = Schema

const TestEntry = literal('dummy').description('dummy')
const NodemailerEntry = literal('nodemailer-smtp').description('SMTP w/ NodeMailer')
const IMAPEntry = literal('imap').description('IMAP w/ node-imap')
const Port = natural().max(65535)

export const schema = intersect([
  // base config
  object({
    name: string(),
    address: string().required().role('email')
  }).description('dispName & account'),

  // sender
  intersect([
    object({
      sender: union([
        NodemailerEntry,
        TestEntry
      ]).description('protocol to send emails').role('radio')
    }).description('send'),
    union([
      object({
        sender: TestEntry.required()

      }),
      object({
        sender: NodemailerEntry.required(),
        nodemailer: object({
          host: string(),
          port: Port.default(465),
          secure: boolean().default(true),
          auth: object({
            user: string(),
            pass: string().role('secret')
          })
        })
      })
    ])
  ]),

  // receiver
  intersect([
    object({
      receiver: union([
        IMAPEntry,
        TestEntry
      ]).description('protocol to receive mails').role('radio')
    }).description('receive'),
    union([
      object({
        receiver: TestEntry.required()
      }),
      object({
        receiver: IMAPEntry.required(),
        imap: object({
          user: string(),
          password: string().role('secret'),
          host: string(),
          port: Port.default(993),
          tls: boolean().default(true)
        })
      })
    ])
  ])
])

//

export type Options = {
  address: string,
  name: string,
} & (
    | {
      sender: 'dummy'
    }
    | {
      sender: 'disabled'
    }
    | {
      sender: 'nodemailer-smtp'
      nodemailer: {
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
      receiver: 'dummy',
    }
    | {
      receiver: 'disabled',
    }
    | {
      receiver: 'imap',
      imap: {
        user: string,
        password: string
      }
    }
  )

export const name = 'adapter-mail'
export function apply (ctx: Context, config: Config) {
  ctx.plugin(MailBot, config)
}
