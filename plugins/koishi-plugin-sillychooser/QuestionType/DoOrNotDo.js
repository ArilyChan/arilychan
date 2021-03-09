"use strict";

const ReplyObject = require("../objects/ReplyObject");
/**
 * DoOrNotDo
 * @param {AskObject} askObject askObject
 * @returns {ReplyObject} replyObject
 */
function DoOrNotDo(askObject) {
    const ask = askObject.ask;
    const reply = new ReplyObject(askObject);

    const result = ask.match(/(.+)[不没]\1/); // 你到底吃过没吃过饭？
    const doOrNotDoString = result[0]; // 吃过没吃过
    const doString = result[1]; // 吃过
    const notString = doOrNotDoString[doOrNotDoString.lastIndexOf(doString) - 1]; // 没
    let endString = ask.substring(ask.indexOf(doOrNotDoString) + doOrNotDoString.length); // 饭？

    // 具体情况：
    // 今天晚上 [吃] 不 [吃] 饭 = 回答：[吃]饭/不[吃]饭
    // 今天晚上 [要] 不 [要] 吃饭 = 回答：[要]吃饭/不[要]吃饭
    // 今天晚上 [吃饭] 不 [吃饭] = 回答：[吃饭]/不[吃饭]

    // 细节处理
    // 重复词有“！”视为恶意代码，不作回应（没人会用"学!code不学!code"聊天吧）
    if (doString.includes("!") || doString.includes("！")) return reply.no();
    // 结束词包含疑问词/符号，取符号前的语句
    if (endString.length > 0) {
        const endStringRegex = /(.*?)(?=\?|？|!|！|,|，|\.|。|呢)+/;
        const matchResult = endString.match(endStringRegex);
        if (matchResult instanceof Array) endString = matchResult[0];
    }

    // 输出
    const replyString = doString + endString;

    if (notString === "没") reply.setChoices([`${replyString}了`, `没${replyString}`]);
    else reply.setChoices([replyString, `不${replyString}`]);
    return reply;
}


module.exports = DoOrNotDo;
