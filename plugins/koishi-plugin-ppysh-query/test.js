"use strict";

const ppyshQuery = require("./index").PpyshQuery;

let psq = new ppyshQuery({
    admin: ["2","3"],
    apiKey: require("./apiToken.json").apiToken,
    database: "./database.db",
    prefix: "?",
    prefix2: "？"
})


let myQQ = "1";
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on("line", async (line) => {
    if (line === "qq2") {
        myQQ = "2";
        console.log("你的QQ号是2了");
    }
    else if (line === "qq1") {
        myQQ = "1";
        console.log("你的QQ号是1了");
    }
    else if (line === "qq3") {
        myQQ = "3";
        console.log("你的QQ号是3了");
    }
    else console.log(await psq.apply(myQQ, line));
});

