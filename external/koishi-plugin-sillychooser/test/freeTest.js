"use strict";

const sillyChooser = require("../index");
let sc = new sillyChooser({prefixs: ["?", "？"]});

// 模拟meta
console.log("你的QQ号是1了");

let myQQ = "1";
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", (line) => {
    if (line === "qq2") {
        myQQ = "2";
        console.log("你的QQ号是2了");
    }
    else if (line === "qq1") {
        myQQ = "1";
        console.log("你的QQ号是1了");
    }
    else console.log(sc.apply(0, myQQ, line));
});
