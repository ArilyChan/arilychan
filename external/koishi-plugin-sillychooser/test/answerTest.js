/* eslint-disable require-jsdoc */
"use strict";
const AskObject = require("../objects/askObject");
const QuestionTypeHelper = require("../QuestionType/QuestionTypeHelper");

function getAnswer(ask) {
    const askObject = new AskObject({ message: ask });
    const method = QuestionTypeHelper.getMethod(askObject.removeSpecialStrings());
    if (!method) return { ask, reply: ["", ""] };
    const replyObject = method(askObject);
    if (!replyObject.reply) return { ask, reply: ["", ""] };
    return { ask, reply: replyObject.choices };
}

function IsEqual(yourAnswer, correctAnswer) {
    if (JSON.stringify(yourAnswer.reply.sort()) === JSON.stringify((correctAnswer.sort()))) return;
    console.log(yourAnswer.ask + ": " + yourAnswer.reply.join(",") + " not equal to " + correctAnswer.join(",") + "\n");
}

function runTest() {
    // askObject测试
    IsEqual(getAnswer("名字是“我是好人”还是“我是坏人”呢？"), ["“我是好人”", "“我是坏人”"]);
    IsEqual(getAnswer("我们两个一起走，好吗？"), ["好", "不好"]);

    // DoOrNotDo测试
    IsEqual(getAnswer("今天晚上吃不吃饭？"), ["吃饭", "不吃饭"]);
    IsEqual(getAnswer("今天晚上吃没吃饭"), ["吃饭了", "没吃饭"]);
    IsEqual(getAnswer("今天晚上要不要吃饭？"), ["要吃饭", "不要吃饭"]);
    IsEqual(getAnswer("今天晚上吃饭不吃饭"), ["吃饭", "不吃饭"]);
    IsEqual(getAnswer("今天晚上吃饭没吃饭？"), ["吃饭了", "没吃饭"]);

    // TrueOrFalse测试
    IsEqual(getAnswer("你傻逼吗？"), ["我傻逼", "我不傻逼"]);
    IsEqual(getAnswer("你吃了吗？"), ["我吃了", "我没吃"]);
    IsEqual(getAnswer("你吃过了吗？"), ["我吃过了", "我没吃过"]);
    IsEqual(getAnswer("你吃得了吗？"), ["我吃得了", "我吃不了"]);
    IsEqual(getAnswer("你吃不了吗？"), ["我吃得了", "我吃不了"]);
    IsEqual(getAnswer("你不吃吗？"), ["我吃", "我不吃"]);
    IsEqual(getAnswer("你不吃了吗？"), ["我不吃了", "我吃了"]);
    IsEqual(getAnswer("你不吃了？"), ["我不吃了", "我吃了"]);
    IsEqual(getAnswer("你不吃了吗"), ["我不吃了", "我吃了"]);


    console.log("测试完毕\n");
}

runTest();
