"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseReceiver = void 0;
const base_1 = require("../base");
class BaseReceiver extends base_1.BaseIO {
    constructor() {
        super(...arguments);
        this.subscribers = new Set();
    }
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
    }
    unsubscribe(subscriber) {
        this.subscribers.delete(subscriber);
    }
    async incomingChain(mail) {
        // this.logger.debug(`handling mail: ${mail}`)
        const all = [];
        for (const subscriber of this.subscribers) {
            all.push(subscriber(mail));
        }
        await Promise.all(all);
    }
}
exports.BaseReceiver = BaseReceiver;
