"use strict";


class sendMessageObject {
    constructor(handle, userId, message, replyString) {
        // 随机回复抱怨语句
        this.botherLeastTimes = 4; // 相同提问第4+1次开始回复抱怨语句
        this.refuseReplyTimes = 10; // 相同提问大于等于10次不再回复
        // 记录回复对象（QQ号）、对象提出问题、回复时间、回复内容、出现次数
        this.handle = handle;
        this.askSender = userId;
        this.askString = message;
        this.replyString = replyString;
        this.replyTime = (new Date()).getTime();
        this.times = 1;
    }
    // eslint-disable-next-line class-methods-use-this
    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    replyNoBother(times = this.times) {
        const replys = [
            "别再问我啦", "你已经问了好多遍了", "听不见吗", "还听不见吗", "别问啦！", "够啦！",
            "...", "？", "你好烦啊", "讨厌！", "不想回答", "你还问！", "好烦呀！", "哼！",
            "你是复读机吗？", "这个问题我拒绝回答", "我生气啦！", "你听不见吗！",
            "小阿日对你的好感度-100", "你再怎么问都不会有其他结果的",
            "zzz", "您已被管理员禁言", "您已被移出群聊", "核弹已升空"
        ];
        // times越大，选择越靠后的语句
        if (times < this.refuseReplyTimes) return replys[Math.floor(this.getRndInteger((times - this.botherLeastTimes - 1) * replys.length / (this.refuseReplyTimes - this.botherLeastTimes - 1), (times - this.botherLeastTimes) * replys.length / (this.refuseReplyTimes - this.botherLeastTimes - 1)))];
        if (times === this.refuseReplyTimes) return "小阿日不理你了";
        return "";
    }
    craftMessage() {
        if (this.times <= 1) return this.replyString;
        if (this.times < this.botherLeastTimes) return this.replyString + "！".repeat(this.times);
        if (this.times === this.botherLeastTimes) return `都说了${this.replyString}呀！`;
        return this.replyNoBother();
    }
    send() {
        return this.craftMessage();
    }
}



module.exports = sendMessageObject;
