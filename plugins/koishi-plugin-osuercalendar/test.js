"use strict";

const run = require('./run');
const eventPath = './osuercalendar-events.json';

// 模拟meta
class Meta {
    constructor(userId) {
        this.userId = userId;
    }

    send(mes) {
        console.log(mes + "\n");
    }
}


console.log("你的QQ号是1了");

let meta = new Meta("1");

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (line) => {
    if (line.startsWith("qq")) {
        let myQQ = line.substring(2);
        meta = new Meta(myQQ);
        console.log("你的QQ号是"+myQQ+"了");
    }
    else run(meta, eventPath, new Date());
});
