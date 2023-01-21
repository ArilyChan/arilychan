"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.koishiHandler = exports.Fortune = void 0;
const Fortune_1 = __importDefault(require("./lib/Fortune"));
exports.Fortune = Fortune_1.default;
async function koishiHandler(meta, eventPath) {
    try {
        const qqId = meta.userId;
        if (!qqId)
            throw new Error('requires userId');
        const events = require(eventPath);
        const fortuneTeller = new Fortune_1.default(events).binding(qqId);
        const statList = fortuneTeller.today.result;
        let output = '';
        // TODO rewrite cq at
        // if (meta.type === 'private') output += `[CQ:at,id=${qqId}]` + '\n'
        output = output + '今日运势：' + statList.luck + '\n';
        output = output + '今日mod：' + statList.mod;
        if (statList.specialMod)
            output = output + ', ' + statList.specialMod + '（？\n';
        else
            output = output + '\n';
        statList.goodList.forEach((item) => {
            output = output + '宜：' + item.name + '\n\t' + item.good + '\n';
        });
        statList.badList.forEach((item) => {
            output = output + '忌：' + item.name + '\n\t' + item.bad + '\n';
        });
        return output;
    }
    catch (ex) {
        console.error(ex);
        return '一些不好的事情发生了';
    }
}
exports.koishiHandler = koishiHandler;
