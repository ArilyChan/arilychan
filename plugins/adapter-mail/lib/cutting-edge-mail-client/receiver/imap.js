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
function toAddress(addr) {
    if (Array.isArray(addr)) {
        const addrs = addr.map(toAddress);
        const flat = addrs.flat().filter(a => a);
        return flat.length > 0 ? flat : undefined;
    }
    return addr.value.length > 0 ? addr.value : undefined;
}
class IMAPReceiver extends base_receiver_1.BaseReceiver {
    constructor(option, address) {
        super();
        this.logger = new koishi_1.Logger('adapter-mail/receiver/imap');
        this.imap = new node_imap_1.default({
            keepalive: {
                interval: 3600,
                idleInterval: 3600,
                forceNoop: true
            },
            ...option
        });
        this.mail = address;
    }
    async process() {
        const mails = await this.fetch();
        for (const mail of mails) {
            await this.incomingChain(mail);
        }
    }
    async listen() {
        this.logger.debug('listening to new mails');
        await this.openBox('INBOX');
        await this.process();
        this.imap.on('mail', async (numNewMsgs) => {
            this.logger.debug(`receiving ${numNewMsgs} new message(s)`);
            await this.process();
        });
    }
    async fetch(opt, search = ['NEW']) {
        this.logger.debug('receiving unread messages');
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
                if (!uIds.length)
                    return this.logger.debug('nothing to fetch');
                this.logger.debug(`receiving ${uIds.length} mail(s)`);
                const fetch = this.imap.fetch(uIds, fetchOptions);
                fetch.once('end', async () => {
                    this.logger.debug(`received ${mails.length} mails`);
                    await Promise.all(pMsgReceive);
                    resolve(mails);
                });
                fetch.on('error', this.logger.error);
                fetch.on('message', (msg, seq) => {
                    this.logger.debug(`receiving mail #${seq}`);
                    msg.on('body', (stream, info) => {
                        pMsgReceive.push(new Promise((resolve, reject) => {
                            (0, mailparser_1.simpleParser)(stream, async (err, parsed) => {
                                if (err)
                                    reject(err);
                                const to = [];
                                const from = [];
                                if (!parsed.to)
                                    reject(new Error('ParseError: <to> missing'));
                                if (!parsed.from)
                                    reject(new Error('ParseError: <from> missing'));
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
                                    reject(new Error('more than one sender???'));
                                mails.push({
                                    // ...parsed,
                                    // cc: toAddress(parsed.cc),
                                    subject: parsed.subject,
                                    to,
                                    from: from[0],
                                    html: parsed.html || undefined
                                });
                                resolve();
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
        const p = new Promise((resolve, reject) => {
            const onEnd = (...args) => {
                console.log(args);
                this.logger.info('disconnected');
                this.readyState = false;
            };
            const onReady = () => {
                this.logger.info('connected');
                this.readyState = true;
                this.imap.off('error', reject);
                resolve();
            };
            this.imap.once('ready', onReady);
            this.imap.once('error', (err) => {
                this.logger.error(err);
                onEnd();
                reject(err);
            });
            this.imap.once('end', onEnd);
            this.imap.connect();
        });
        p.then(this.listen.bind(this));
        return p;
    }
}
exports.IMAPReceiver = IMAPReceiver;
