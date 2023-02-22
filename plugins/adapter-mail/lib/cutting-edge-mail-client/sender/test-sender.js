"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSender = void 0;
const koishi_1 = require("koishi");
const address_1 = require("../address");
const base_sender_1 = require("./base-sender");
class TestSender extends base_sender_1.BaseSender {
    constructor(...opt) {
        super();
        this.logger = new koishi_1.Logger('adapter-mail/sender');
        this.mail = new address_1.LocalMailAddress(...opt);
    }
    async send(mail) {
        this.logger.debug(mail);
    }
    async prepare() {
        this.logger.debug('ready.');
        this.readyState = true;
    }
}
exports.TestSender = TestSender;
