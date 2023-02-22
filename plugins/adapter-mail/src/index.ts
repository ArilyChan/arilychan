import { Context, Schema } from 'koishi'
import { Config, MailBot } from './adapter'

const { union, object, string, const: literal, natural, boolean, intersect } = Schema

const TestEntry = literal('dummy').description('dummy')
// const Disabled = literal('disabled').description('disabled')
const NodemailerEntry = literal('node-mailer-smtp').description('nodemailer createTransport smtp')
const IMAPEntry = literal('imap').description('IMAP transport w/ node-imap')
const Port = natural().max(65535)

// const testConfig = object({
//   name: string(),
//   address: string()
// })

export const schema = intersect([
  // base config
  object({
    name: string(),
    address: string().required().role('email')
  }).description('dispName & account'),

  // sender
  intersect([
    object({
      senderProtocol: union([
        NodemailerEntry,
        TestEntry
        // Disabled
      ]).description('protocol to send emails').role('radio')
    }).description('sender'),
    union([
      object({
        senderProtocol: TestEntry.required()

      }),
      object({
        senderProtocol: NodemailerEntry.required(),
        sender: object({
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
      receiverProtocol: union([
        IMAPEntry,
        TestEntry
        // Disabled
      ]).description('protocol to receive mails').role('radio')
    }).description('receiver'),
    union([
      object({
        receiverProtocol: TestEntry.required()
      }),
      object({
        receiverProtocol: IMAPEntry.required(),
        receiver: object({
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
      senderProtocol: 'dummy'
    }
    | {
      senderProtocol: 'disabled'
    }
    | {
      senderProtocol: 'node-mailer-smtp'
      sender: {
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
      receiverProtocol: 'dummy',
    }
    | {
      receiverProtocol: 'disabled',
    }
    | {
      receiverProtocol: 'imap',
      receiver: {
        user: string,
        password: string
      }
    }
  )

export const name = 'adapter-mail'
export function apply (ctx: Context, config: Config) {
  ctx.plugin(MailBot, config)
}
