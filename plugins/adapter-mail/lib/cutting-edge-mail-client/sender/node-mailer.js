"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _NodeMailer_constructionArg;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const base_sender_1 = require("./base-sender");
const nodemailer_html_to_text_1 = require("nodemailer-html-to-text");
class NodeMailer extends base_sender_1.BaseSender {
    constructor(arg, address) {
        super();
        _NodeMailer_constructionArg.set(this, void 0);
        __classPrivateFieldSet(this, _NodeMailer_constructionArg, arg, "f");
        this.mail = address;
    }
    async prepare() {
        this.conn = nodemailer_1.default.createTransport({
            ...__classPrivateFieldGet(this, _NodeMailer_constructionArg, "f")
        });
        this.conn.use('compile', (0, nodemailer_html_to_text_1.htmlToText)({}));
        await this.conn.verify();
    }
    async send(mail) {
        if (!this.mail && !mail.from)
            throw new Error('you didn\'t provide an address?');
        if (!mail.html)
            throw new Error('no content');
        return this.conn.sendMail({
            ...mail,
            to: Array.isArray(mail.to) ? mail.to.map(addr => addr.address) : mail.to.address,
            from: (mail.from || this.mail).address,
            html: mail.html
        });
    }
}
exports.NodeMailer = NodeMailer;
_NodeMailer_constructionArg = new WeakMap();
