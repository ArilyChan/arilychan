"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailBot = void 0;
const Receiver = __importStar(require("../cutting-edge-mail-client/receiver"));
const Sender = __importStar(require("../cutting-edge-mail-client/sender"));
const koishi_1 = require("koishi");
const bridge_between_mail_and_message_1 = require("../bridge-between-mail-and-message");
const cutting_edge_mail_client_1 = __importDefault(require("../cutting-edge-mail-client"));
const address_1 = require("../cutting-edge-mail-client/address");
class MailBot extends koishi_1.Bot {
    constructor(ctx, config) {
        const address = new address_1.LocalMailAddress({ address: config.address, name: config.name });
        let sender, receiver;
        if (!config)
            throw new Error('missing config');
        switch (config.sender) {
            case 'nodemailer-smtp': {
                sender = new Sender.NodeMailer(config.nodemailer, address);
                break;
            }
            case 'dummy': {
                sender = new Sender.TestSender({ name: config.name, address: config.address });
                break;
            }
            // case 'disabled': {
            //   break
            // }
            default: {
                throw new Error('unknown adapter');
            }
        }
        switch (config.receiver) {
            case 'imap': {
                receiver = new Receiver.IMAPReceiver(config.imap, address);
                break;
            }
            case 'dummy': {
                receiver = new Receiver.TestReceiver({ name: config.name, address: config.address });
                break;
            }
            // case 'disabled': {
            //   break
            // }
            default: {
                throw new Error('unknown receiver');
            }
        }
        const selfId = sender.mail.address;
        super(ctx, {
            platform: 'mail',
            selfId
        });
        this.logger = new koishi_1.Logger('adapter-mail');
        this.client = new cutting_edge_mail_client_1.default();
        this.bridge = new bridge_between_mail_and_message_1.Bridge();
        this.receiver = receiver;
        this.sender = sender;
        this.subscribe();
    }
    async subscribe() {
        this.logger.debug('connecting');
        this.status = 'connect';
        await Promise.all([
            this.client.useReceiver(this.receiver),
            this.client.useSender(this.sender)
        ]);
        this.bridge.useClient(this.client);
        this._subscriber = (msg) => this.receivedMessage(msg);
        this.bridge.subscribe(this._subscriber);
        this.bridge.bridge();
        this.logger.debug('ready');
        this.status = 'online';
    }
    receivedMessage(message) {
        this.logger.debug('received message: ' + message.elements);
        const { from: { id: userId, name: username }, elements, id } = message;
        const session = this.session({ messageId: id, author: { userId, username }, channelId: userId, channelName: username, elements, type: 'message', subtype: 'private' });
        this.dispatch(session);
    }
    async sendMessage(channelId, content) {
        this.logger.debug('sendMessage ' + channelId);
        return this.sendPrivateMessage(channelId, content);
    }
    async sendPrivateMessage(userId, content, options) {
        if (options) {
            throw new Error('send options not supported yet');
        }
        await this.bridge.sendMessage({
            to: {
                id: userId
            },
            from: {
                id: this.sender.mail.address,
                name: this.sender.mail.name
            },
            content
        });
        return [];
    }
    async stop() {
        this.bridge.unsubscribe(this._subscriber);
    }
    getSelf() {
        return Promise.resolve({
            userId: this.sender.mail.address,
            username: this.sender.mail.name
        });
    }
    getFriendList() {
        return Promise.resolve([]);
    }
    getGuild(guildId) {
        return Promise.resolve({
            guildId: 'never'
        });
    }
    getGuildList() {
        return Promise.resolve([]);
    }
    getGuildMember() {
        return Promise.resolve({
            userId: 'never'
        });
    }
    getGuildMemberList() {
        return Promise.resolve([]);
    }
    getChannel() {
        return Promise.resolve({
            channelId: 'never'
        });
    }
    getChannelList() {
        return Promise.resolve([]);
    }
    handleFriendRequest() {
        return Promise.resolve();
    }
    handleGuildRequest() {
        return Promise.resolve();
    }
    handleGuildMemberRequest() {
        return Promise.resolve();
    }
}
exports.MailBot = MailBot;
// export default class MailAdapter extends Adapter<MailBot> {
//   app: App
//   bots: Bot[]
//   constructor (app: App, bot: MailBot) {
//     // 请注意这里的第二个参数是应该是一个构造函数而非实例
//     super()
//     bot.adapter = this
//   }
//   async connect (bot: MailBot) {
//     if (!config) throw new Error('I lost my config')
//     switch (config.sender[0]) {
//       case 'nodemailer': {
//         const [, ...conf] = config.sender
//         sender = new Sender.NodeMailer(...conf)
//         break
//       }
//       case 'test': {
//         const [, ...conf] = config.sender
//         sender = new Sender.TestSender(...conf)
//         break
//       }
//       default: {
//         throw new Error('unknown adapter')
//       }
//     }
//     switch (config.receiver[0]) {
//       case 'imap': {
//         const [, ...conf] = config.receiver
//         receiver = new Receiver.IMAPReceiver(...conf)
//         break
//       }
//       case 'test': {
//         const [, ...conf] = config.receiver
//         receiver = new Receiver.TestReceiver(...conf)
//         break
//       }
//       default: {
//         throw new Error('unknown receiver')
//       }
//     }
//    this.client.useReceiver(receiver)
//    this.client.useSender(sender)
//     bot.bridge.useClient(bot.client)
//     bot.subscribe()
//   }
//   async stop () {
//     this.bots.map(bot => bot.stop())
//   }
// }
