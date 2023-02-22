"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestReceiver = void 0;
const koishi_1 = require("koishi");
const base_receiver_1 = require("./base-receiver");
const address_1 = require("../address");
class TestReceiver extends base_receiver_1.BaseReceiver {
    constructor(...opt) {
        super();
        this.logger = new koishi_1.Logger('adapter-mail/receiver');
        this.mail = new address_1.LocalMailAddress(...opt);
    }
    async fetch() {
        this.logger.debug('receiving unread messages');
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve([this.createFakeMail({
                    html: 'test message'
                })]), 2000);
        });
    }
    async prepare() {
        this.logger.debug('preparing receiver');
    }
    async _fakeMail(context) {
        const mail = this.createFakeMail(context);
        return await this.incomingChain(mail);
    }
    createFakeMail(context) {
        if (!context)
            throw new Error('No context provided');
        const mail = {
            to: this.mail,
            from: new address_1.MailAddress({
                name: 'unknown',
                address: 'unknown-sender@koishi.js'
            }),
            subject: 'hello',
            attachments: [],
            html: '',
            ...context
        };
        return mail;
    }
}
exports.TestReceiver = TestReceiver;
