/* eslint-disable complexity */

"use strict";

const ReplyObject = require("../objects/ReplyObject");
const path = require("path");

// segment分词
// 载入模块
const Segment = require("segment");
// 创建实例
const segment = new Segment();
// 使用识别模块及字典
segment
    // 分词模块
    // 强制分割类单词识别
    // .use('URLTokenizer')            // URL识别
    // .use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
    // .use('PunctuationTokenizer')    // 标点符号识别
    // .use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
    // 中文单词识别
    .use("DictTokenizer")           // 词典识别
    // .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后
    // 优化模块
    // .use('EmailOptimizer')          // 邮箱地址识别
    // .use('ChsNameOptimizer')        // 人名识别优化
    // .use('DictOptimizer')           // 词典识别优化
    // .use('DatetimeOptimizer')       // 日期时间识别优化
    // 字典文件
    // .loadDict('dict.txt')           // 盘古词典
    // .loadDict('dict2.txt')          // 扩展词典（用于调整原盘古词典）
    // .loadDict('names.txt')          // 常见名词、人名
    // .loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符
    // .loadSynonymDict('synonym.txt')   // 同义词
    // .loadStopwordDict('stopword.txt') // 停止符
    // 自定义词典
    .loadDict(path.join(__dirname, "../segmentUserDict/singledict.txt"))  // 复制原dict，删除一些词组，防止词组改变词性
    .loadDict(path.join(__dirname, "../segmentUserDict/osu.txt"))  // osu专用语
    .loadDict(path.join(__dirname, "../segmentUserDict/ywc.txt"));  // 疑问词


/** 倒序(end -> start)查找语气词y，返回语气词y在解析结果中的index
* @param {object} result 解析结果
* @param {int} end endInedx
* @returns {int} yIndex
*/
function lastIndexOfY(result, end = result.length - 1) {
    // eslint-disable-next-line curly
    for (let i = end; i >= 0; i--) {
        if (result[i].p === 0x200) return i;
    }
    // 没有找到语气词
    return -1;
}

/** 查找形容词或动词，返回形容词或动词在解析结果中的index
* @param {object} result 解析结果
* @param {int} start startInedx
* @returns {int} avIndex
*/
function indexOfAV(result, start = 0) {
    // eslint-disable-next-line curly
    for (let i = start; i < result.length; i++) {
        if (result[i].p === 0x40000000 || result[i].p === 0x1000) return i;
    }
    // 没有找到形容词或动词
    return -1;
}

/** 查找形容词动词词组
* @param {object} result 解析结果
* @param {int} start startInedx
* @returns {object} {wordsIndex: 词组第一个词在解析结果中的index, AIndex: 形容词在words中的index, ALength, VIndex: 动词在words中的index, VLength, words: 该词组}
*/
function getAVWords(result, start = 0) {
    let words = "";
    let VIndex = 114514;
    let VLength = 0;
    let AIndex = 114514;
    let ALength = 0;
    let length = 0;
    let index = indexOfAV(result, start);
    if (index < 0) return { wordsIndex: -1 };
    // 向前包括助词和人称代词
    if ((index > 0) && (result[index - 1].w === "没" || result[index - 1].w === "不")) index = index - 1;
    if ((index > 0) && (result[index - 1].p === 0x10000)) index = index - 1;
    while (index < result.length) {
        if (result[index].p === 0x40000000) { // 形容词
            words = words + result[index].w;
            if (AIndex >= 114514) {
                AIndex = length;
                ALength = result[index].w.length;
                if (AIndex > 0 && words[AIndex - 1] === "不") {
                    AIndex = AIndex - 1;
                    ALength = ALength + 1;
                }
            }
            length = length + result[index].w.length;
            index = index + 1;
        } else if (result[index].p === 0x1000) { // 动词
            words = words + result[index].w;
            if (VIndex >= 114514) {
                VIndex = length;
                VLength = result[index].w.length;
                if ((VIndex > 0) && (words[VIndex - 1] === "不" || words[VIndex - 1] === "没")) {
                    VIndex = VIndex - 1;
                    VLength = VLength + 1;
                }
            }
            else if (VIndex + VLength === length) VLength = VLength + result[index].w.length; // 连续动词
            length = length + result[index].w.length;
            index = index + 1;
        } else if (result[index].p === 0x10000) { // 代词
            words = words + result[index].w;
            length = length + result[index].w.length;
            index = index + 1;
        } else if (result[index].w === "了" || result[index].w === "得" || result[index].w === "没" || result[index].w === "不") {
            words = words + result[index].w;
            if (VIndex + VLength === length) VLength = VLength + 1;
            length = length + 1;
            index = index + 1;
        } else if (result[index].w === "过") {
            if (VIndex + VLength === length) {
                words = words + result[index].w;
                VLength = VLength + 1;
                length = length + 1;
                index = index + 1;
            }
        }
        else break;
    }
    if (index < 0) index = 0;
    return { wordsIndex: index, VIndex, VLength, AIndex, ALength, words };
}

/**
 * 处理avWords
 * @param {object} av avWords
 * @returns {array} choices
 */
function AVWords2Choices(av) {
    // 第一个是形容词
    if (av.AIndex < av.VIndex) {
        // 形容词很简单，在前面加不就行了
        if (av.words[av.AIndex] === "不") return [av.words.substr(0, av.AIndex) + av.words.substr(av.AIndex + 1), av.words];
        return [av.words, av.words.substr(0, av.AIndex) + "不" + av.words.substr(av.AIndex)];
    }

    // 第一个是动词
    if (av.VIndex < av.AIndex) {
        if (av.words[av.VIndex] === "不") return [av.words.substr(0, av.VIndex) + av.words.substr(av.VIndex + 1), av.words];
        if (av.words[av.VIndex] === "没") return [av.words.substr(0, av.VIndex) + av.words.substr(av.VIndex + 1) + "了", av.words]; // “了”放最后
        if (av.words.substr(av.VIndex, av.VLength).endsWith("不了")) return [av.words.substr(0, av.VIndex) + av.words.substr(av.VIndex, av.VLength - 2) + "得了" + av.words.substr(av.VIndex + av.VLength), av.words];
        if (av.words.substr(av.VIndex, av.VLength).endsWith("得了")) return [av.words, av.words.substr(0, av.VIndex) + av.words.substr(av.VIndex, av.VLength - 2) + "不了" + av.words.substr(av.VIndex + av.VLength)];
        if (av.words[av.VIndex + av.VLength - 1] === "了") return [av.words, av.words.substr(0, av.VIndex) + "没" + av.words.substr(av.VIndex, av.VLength - 1) + av.words.substr(av.VIndex + av.VLength)];
        return [av.words, av.words.substr(0, av.VIndex) + "不" + av.words.substr(av.VIndex)];
    }

    // 不应该两种都没有
    return ["", ""];
}


/** 检查解析结果是否包含指定字词
* @param {object} result 解析结果
* @param {int} word 字词
* @returns {boolean} 是否包含
*/
function isResultContainWord(result, word) {
    let isContain = false;
    result.forEach((r, i) => {
        if (r.w === word) isContain = true;
    });
    return isContain;
}


/**
 * TrueOrFalse
 * @param {AskObject} askObject askObject
 * @returns {ReplyObject} replyObject
 */
function TrueOrFalse(askObject) {
    const ask = askObject.ask;
    const reply = new ReplyObject(askObject);

    const result = segment.doSegment(ask, {
        // stripPunctuation: true // 去除标点
    });
    // https://github.com/leizongmin/node-segment/blob/master/lib/POSTAG.js

    // 测试用
    // result.forEach((words) => { words.tag = Segment.POSTAG.chsName(words.p) });

    // 倒序查询语气词y
    const yIndex = lastIndexOfY(result);
    if (yIndex < 1) return reply.no(); // 单独一个“吗”字也不行

    // 判断语气词y前一个词
    if (result[yIndex - 1].w === "什么") return reply.no(); // 不是选择性疑问句

    // 查询动词形容词词组
    const av = getAVWords(result);
    if (av.wordsIndex < 0) return reply.no();

    else if (isResultContainWord(result, "是")) return reply.setChoices(["是", "不是"]); // 直接从原句中找“是”更好，因为分析有可能不会单独拆下“是”，下面几个同理
    else if (isResultContainWord(result, "会")) return reply.setChoices(["会", "不会"]);
    else if (isResultContainWord(result, "能")) return reply.setChoices(["能", "不能"]);

    return reply.setChoices(AVWords2Choices(av));

}


module.exports = TrueOrFalse;
