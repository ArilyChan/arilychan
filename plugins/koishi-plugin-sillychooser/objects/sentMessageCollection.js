"use strict";

class sentMessageCollection {
    constructor() {
        this.sentMessages = []; // sendMessageObject 数组
        this.timeouts = {}; // 计时器 数组
        this.maxHandle = 0; // 记录smo的最大handle
    }

    add(smo) {
        this.maxHandle += 1;
        this.sentMessages.push(smo);
        this.timeouts[smo.handle] = setTimeout((item) => this.remove(item), 1000 * 60 * 1, smo);
    }

    remove(smo) {
        this.sentMessages = this.sentMessages.filter((item) => item.handle !== smo.handle);
        if (this.timeouts[smo.handle]) {
            clearTimeout(this.timeouts[smo.handle]);
            delete this.timeouts[smo.handle];
        }
    }

    findSameAsk(smo) {
        const findSmo = this.sentMessages.filter((item) => item.askSender === smo.askSender && item.askString === smo.askString);
        return findSmo;
    }

    putIn(smo) {
        // 先检查sentMessage里有没有相同发送者且相同消息的
        // 如果没有就直接add，如果有就把现在的times和replyString覆盖掉，然后删掉原来的add现在的
        const sameSmo = this.findSameAsk(smo);
        sameSmo.map((item) => {
            smo.times = item.times + 1;
            smo.replyString = item.replyString;
            this.remove(item);
            return null;
        });
        this.add(smo);
        return smo;
    }
}

module.exports = sentMessageCollection;
