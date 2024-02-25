"use strict";

const ReplyObject = require("../objects/ReplyObject");


/**
 * ThisOrThat
 * @param {AskObject} askObject askObject
 * @returns {ReplyObject} replyObject
 */
function ThisOrThat(askObject) {
    const ask = askObject.ask;
    const reply = new ReplyObject(askObject);

    // 按“还是”分割
    let arrDo = ask.split("还是");
    // arrDo不应为undefined，应用该方法前ask应该已经被筛选过

    // 如果有“是”，去掉是之前的词
    const isIndex = arrDo[0].lastIndexOf("是");
    if (isIndex >= 0 && isIndex < arrDo[0].length - 1) arrDo[0] = arrDo[0].substring(isIndex + 1);

    // 重复词有“！”视为恶意代码，不作回应
    const isCommand = arrDo.some((item, index) => {
        if (item.includes("!") || item.includes("！")) return true;
        return false;
    });
    if (isCommand) return reply.no();

    // 包含疑问词/符号，取符号前的do语句
    const doStringRegex = /(.*?)(?=\?|？|,|，|\.|。|呢)+/;
    arrDo.map((item, index) => {
        const matchResult = item.match(doStringRegex);
        if (matchResult instanceof Array) arrDo[index] = matchResult[0];
        return null;
    });

    // 去除空值
    arrDo = arrDo.filter((item) => item.trim() !== "");
    if (arrDo.length <= 0) return reply.no();

    // 生成选项
    reply.setChoices(arrDo);
    return reply;
}

/* #endregion */

module.exports = ThisOrThat;
