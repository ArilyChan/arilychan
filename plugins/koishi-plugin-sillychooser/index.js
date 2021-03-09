"use strict";

const AskObject = require("./objects/askObject");
const QuestionTypeHelper = require("./QuestionType/QuestionTypeHelper");
const SendMessageObject = require("./objects/sendMessageObject");
const SentMessageCollection = require("./objects/sentMessageCollection");

class sillyChooser {
    /**
     * @param {Object} params 
     * @param {Array<String>} [params.prefixs] 指令前缀，必须为单个字符，默认为["!","！"]
     */
    constructor(params) {
        this.prefixs = params.prefixs || ["!", "！"];
        this.smc = new SentMessageCollection();
    }
    /**
     * 获得返回消息
     * @param {Number} botId
     * @param {Number} qqId
     * @param {String} message 输入的消息
     */
    apply(botId, qqId, message) {
        try {
            if (!message.length || message.length < 2) return "";
            const atBot = `[CQ:at,qq=${botId}]`;
            if (message.substring(0, atBot.length) === atBot) message = message.substring(atBot.length).trim();
            else if (this.prefixs.indexOf(message.substring(0, 1)) >= 0) message = message.substring(1).trim();
            else return "";
            if (!message) return "";

            const askObject = new AskObject(message);
            const method = QuestionTypeHelper.getMethod(askObject.removeSpecialStrings());
            if (!method) return "";
            const replyObject = method(askObject);
            if (!replyObject.reply) return "";
            // 测试用
            // console.log(replyObject.choices);
            const replyString = replyObject.toString();
            if (!replyString) return "";
            let smo = new SendMessageObject(this.smc.maxHandle, qqId, message, replyString);
            smo = this.smc.putIn(smo);
            return smo.send();
        } catch (ex) {
            console.log(ex);
            return "";
        }
    }
}


module.exports.sillyChooser = sillyChooser;
// koishi插件
module.exports.name = 'koishi-plugin-sillychooser';
module.exports.apply = (ctx, options) => {
    const sc = new sillyChooser(options)
    ctx.middleware(async (meta, next) => {
        try {
            const message = meta.message;
            const userId = meta.userId;
            const reply = sc.apply(meta.selfId, userId, message);
            if (!reply) return next();
            const replyMessage = [];
            if (meta.messageType !== 'private') replyMessage.push(`[CQ:reply,id=${meta.messageId}]`);
            replyMessage.push(reply);
            // if (reply) return meta.$send(`[CQ:at,qq=${userId}]` + '\n' + reply)
            await meta.$send(replyMessage.join(''));
        } catch (ex) {
            console.log(ex);
            return next();
        }
    })
}


