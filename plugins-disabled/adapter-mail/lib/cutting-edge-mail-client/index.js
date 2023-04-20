"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koishi_1 = require("koishi");
class MailClient {
    constructor() {
        this.senders = new Map();
        this.receivers = new Map();
        this.logger = new koishi_1.Logger('adapter-mail/client');
    }
    async useSender(sender) {
        if (!Array.isArray(sender.mail)) {
            if (this.senders.has(sender.mail))
                return;
            this.senders.set(sender.mail, sender);
        }
        else {
            sender.mail.forEach(c => {
                if (this.senders.has(c))
                    return;
                this.senders.set(c, sender);
            });
        }
        if (!sender.readyState)
            return await sender.prepare();
    }
    // TODO: unuseSender
    async useReceiver(receiver) {
        if (!Array.isArray(receiver.mail)) {
            if (this.receivers.has(receiver.mail))
                return;
            this.receivers.set(receiver.mail, receiver);
        }
        else {
            receiver.mail.forEach(c => {
                if (this.receivers.has(c))
                    return;
                this.receivers.set(c, receiver);
            });
        }
        if (!receiver.readyState)
            return await receiver.prepare();
    }
    // TODO: unuseReceiver
    subscribe(subscriber) {
        this.receivers.forEach(receivers => receivers.subscribe(subscriber));
    }
    unsubscribe(subscriber) {
        this.receivers.forEach(receivers => receivers.unsubscribe(subscriber));
    }
    async send(mail, sender) {
        if (!mail.to) {
            return this.logger.error('Cannot send mail. missing `to`.');
        }
        if (!mail.from && !sender) {
            return this.logger.error('Cannot send mail. missing sender.');
        }
        sender = sender ?? (mail.from && this.findSender(mail.from));
        if (!sender) {
            this.logger.error('Cannot send mail, cannot find sender.');
            console.trace();
            return;
        }
        mail.from = mail.from ?? sender.mail;
        if (!mail.from) {
            this.logger.error('Cannot send mail, cannot find correlated mail address.');
            console.trace();
            return;
        }
        return await sender.send(mail);
    }
    findSender(IAddress) {
        return (IAddress.local && this.senders.get(IAddress)) ??
            ([...this.senders.entries()].find(([c]) => c.address === IAddress.address)?.[1]);
    }
}
exports.default = MailClient;
