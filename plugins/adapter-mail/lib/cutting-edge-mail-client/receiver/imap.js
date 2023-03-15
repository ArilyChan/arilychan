"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAPReceiver = void 0;
const address_1 = require("../address");
const koishi_1 = require("koishi");
const base_receiver_1 = require("./base-receiver");
const mailparser_1 = require("mailparser");
const node_imap_1 = __importDefault(require("node-imap"));
class IMAPReceiver extends base_receiver_1.BaseReceiver {
    constructor(option, address) {
        super();
        this.logger = new koishi_1.Logger('adapter-mail/receiver/imap');
        this.imap = new node_imap_1.default({
            keepalive: true,
            ...option
            // debug: this.logger.extend('verbose').debug
        });
        this.mail = address;
    }
    async process() {
        const mails = await this.fetch();
        if (!mails)
            return;
        for (const mail of mails) {
            this.receivedMail(mail);
        }
    }
    async listen() {
        await this.openBox('INBOX');
        await this.process();
        this.logger.debug('listening to new mails');
        this.imap.on('mail', async (numNewMsgs) => {
            this.logger.debug(`got ${numNewMsgs} new mail(s)`);
            await this.process();
        });
    }
    async fetch(opt, search = ['UNSEEN']) {
        this.logger.debug('fetching messages');
        const fetchOptions = opt || {
            bodies: '',
            markSeen: true
        };
        // const { box, close } = await this.openBox('INBOX')
        const mails = [];
        const pMsgReceive = [];
        return new Promise((resolve, reject) => {
            this.imap.search(search, (err, uIds) => {
                if (err)
                    reject(err);
                if (!uIds.length) {
                    this.logger.debug('nothing to fetch');
                    return resolve([]);
                }
                this.logger.debug(`receiving ${uIds.length} mail(s)`);
                const fetch = this.imap.fetch(uIds, fetchOptions);
                fetch.once('end', async () => {
                    await Promise.all(pMsgReceive);
                    this.logger.debug(`received ${mails.length} mails`);
                    resolve(mails);
                });
                fetch.on('error', this.logger.error);
                fetch.on('message', (msg, seq) => {
                    this.logger.debug(`receiving mail #${seq}`);
                    msg.on('body', (stream, info) => {
                        // eslint-disable-next-line promise/param-names
                        pMsgReceive.push(new Promise((resolve2, reject2) => {
                            (0, mailparser_1.simpleParser)(stream, async (err, parsed) => {
                                if (err)
                                    reject2(err);
                                const to = [];
                                const from = [];
                                if (!parsed.to)
                                    reject2(new Error('ParseError: missing <to>'));
                                if (!parsed.from)
                                    reject2(new Error('ParseError: missing <from>'));
                                const iterateTo = addObj => {
                                    addObj.value.forEach(addr => to.push(new address_1.LocalMailAddress({ name: addr.name, address: addr.address || 'unknown@unknown' })));
                                };
                                if (Array.isArray(parsed.to)) {
                                    parsed.to.forEach(iterateTo);
                                }
                                else {
                                    iterateTo(parsed.to);
                                }
                                parsed.from?.value.forEach(mail => from.push(new address_1.MailAddress({ name: mail.name, address: mail.address || 'unknown@unknown' })));
                                if (from.length > 1)
                                    reject2(new Error('more than one sender???'));
                                mails.push({
                                    // ...parsed,
                                    // cc: toAddress(parsed.cc),
                                    subject: parsed.subject,
                                    to,
                                    from: from[0],
                                    html: parsed.html || undefined,
                                    text: parsed.text
                                });
                                resolve2();
                            });
                        }));
                    });
                });
            });
        });
    }
    async openBox(mailboxName) {
        this.logger.debug(`opening box: ${mailboxName}`);
        return await new Promise((resolve, reject) => {
            return this.imap.openBox(mailboxName, false, (err, box) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        box,
                        close: () => new Promise((resolve, reject) => this.imap.closeBox((err) => err ? reject(err) : resolve()))
                    });
                }
            });
        });
    }
    async stop() {
        clearInterval(this.interval);
    }
    async prepare() {
        this.logger.debug('connecting to imap server');
        return this.retry(0);
    }
    async retry(retries = 0) {
        const p = new Promise((resolve, reject) => {
            const onEnd = () => {
                this.logger.info('disconnected');
                this.readyState = false;
                if (retries >= 3)
                    reject(new Error('max retries exceed'));
                this.imap.off('ready', onReady);
                this.imap.off('ready', onError);
                this.imap.off('ready', onEnd);
                this.retry(retries + 1).then(resolve);
            };
            const onReady = () => {
                this.logger.info('connected');
                this.readyState = true;
                // this.imap.off('error', onError)
                resolve();
                this.listen();
            };
            const onError = (err) => {
                this.logger.error(err);
                onEnd();
                reject(err);
            };
            this.imap.once('ready', onReady);
            this.imap.once('error', onError);
            this.imap.once('end', onEnd);
            this.imap.connect();
        });
        return p;
    }
}
exports.IMAPReceiver = IMAPReceiver;
