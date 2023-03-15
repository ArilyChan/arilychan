"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Bridge_separator, _Bridge_toMessagePipeline;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
const address_1 = require("../cutting-edge-mail-client/address");
const koishi_1 = require("koishi");
const toMessage_1 = require("./toMessage");
const html_template_1 = require("../html-template");
class Bridge {
    constructor() {
        this.subscribers = new Set();
        this.logger = new koishi_1.Logger('adapter-mail/bridge');
        _Bridge_separator.set(this, '% reply before this line %');
        _Bridge_toMessagePipeline.set(this, (0, toMessage_1.pipeline)({
            separator: __classPrivateFieldGet(this, _Bridge_separator, "f")
        }));
    }
    get separator() {
        return __classPrivateFieldGet(this, _Bridge_separator, "f");
    }
    set separator(value) {
        __classPrivateFieldSet(this, _Bridge_separator, value, "f");
        __classPrivateFieldSet(this, _Bridge_toMessagePipeline, (0, toMessage_1.pipeline)({ separator: value }), "f");
    }
    useClient(mailClient) {
        this.client = mailClient;
    }
    async useSender(sender) {
        await this.client?.useSender(sender);
    }
    async useReceiver(receiver) {
        await this.client?.useReceiver(receiver);
    }
    bridge() {
        this.client?.subscribe((arg) => this.handleReceivedMail(arg));
    }
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
    }
    unsubscribe(subscriber) {
        this.subscribers.delete(subscriber);
    }
    async handleReceivedMail(mail) {
        try {
            const message = await this.toMessage(mail);
            if (!message)
                return;
            this.subscribers.forEach((subscriber) => subscriber(message));
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    async toMessage(mail) {
        const result = await __classPrivateFieldGet(this, _Bridge_toMessagePipeline, "f").call(this, mail);
        if (!result) {
            return;
        }
        const { content: elements, id } = result;
        return {
            from: {
                id: mail.from.address,
                name: mail.from.name
            },
            elements,
            id
        };
    }
    async sendMessage({ to, from, content }) {
        const messageId = (Math.random() * 114514 * 1919810).toFixed();
        const h = (0, html_template_1.html) `
<style>
p, .bot-reply-container {
  white-space: pre;
}
</style>
<p>${__classPrivateFieldGet(this, _Bridge_separator, "f")}</p>
<div class="bot-reply-container">${content}</div>
    `;
        this.client.send({
            to: new address_1.MailAddress({ address: to.id, name: to.name }),
            from: new address_1.LocalMailAddress({ address: from.id, name: from.name }),
            html: h,
            subject: `#k-id=${messageId}#`,
            messageId
        });
    }
}
exports.Bridge = Bridge;
_Bridge_separator = new WeakMap(), _Bridge_toMessagePipeline = new WeakMap();
