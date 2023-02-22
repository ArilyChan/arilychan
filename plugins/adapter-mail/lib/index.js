"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = exports.schema = void 0;
const koishi_1 = require("koishi");
const adapter_1 = require("./adapter");
const { union, object, string, const: literal, natural, boolean, intersect } = koishi_1.Schema;
const TestEntry = literal('dummy').description('dummy');
// const Disabled = literal('disabled').description('disabled')
const NodemailerEntry = literal('node-mailer-smtp').description('nodemailer createTransport smtp');
const IMAPEntry = literal('imap').description('IMAP transport w/ node-imap');
const Port = natural().max(65535);
// const testConfig = object({
//   name: string(),
//   address: string()
// })
exports.schema = intersect([
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
]);
exports.name = 'adapter-mail';
function apply(ctx, config) {
    ctx.plugin(adapter_1.MailBot, config);
}
exports.apply = apply;
