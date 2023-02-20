import { Context, Schema } from 'koishi'
import { Config, MailBot } from './adapter'

const { union, object, string, const: literal, natural, boolean, intersect } = Schema

const TestEntry = literal('test').description('test')
const Disabled = literal('disabled').description('disable')
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
      protocol: object({
        sender: union([
          NodemailerEntry,
          TestEntry,
          Disabled
        ]).description('protocol').role('radio')
      })
    }).description('sender'),
    union([
      object({
        protocol: object({
          sender: TestEntry
        }).required()
      }),
      object({
        protocol: object({
          sender: NodemailerEntry
        }).required(),
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
      protocol: object({
        receiver: union([
          IMAPEntry,
          TestEntry,
          Disabled
        ]).description('protocol').role('radio')
      })
    }).description('receiver'),
    union([
      object({
        protocol: object({
          receiver: TestEntry
        }).required()
      }),
      object({
        protocol: object({
          receiver: IMAPEntry
        }).required(),
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
  name: string
} & (
  | {
    protocol: {
      sender: 'test'
    }
  }
  | {
    protocol: {
      sender: 'node-mailer-smtp'
    },
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
      protocol: {
        receiver: 'test',
      }
    }
    | {
      protocol: {
        receiver: 'imap',
      }
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
