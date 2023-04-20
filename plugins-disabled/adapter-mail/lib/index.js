"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = exports.schema = void 0;
const koishi_1 = require("koishi");
const adapter_1 = require("./adapter");
const { union, object, string, const: literal, natural, boolean, intersect } = koishi_1.Schema;
const TestEntry = literal('dummy').description('dummy');
const NodemailerEntry = literal('nodemailer-smtp').description('SMTP w/ NodeMailer');
const IMAPEntry = literal('imap').description('IMAP w/ node-imap');
const Port = natural().max(65535);
exports.schema = intersect([
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
]);
exports.name = 'adapter-mail';
function apply(ctx, config) {
    ctx.plugin(adapter_1.MailBot, config);
}
exports.apply = apply;
