
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "info",
    info: "具体谱面查询",
    command: ["info"],
    argsInfo: "[玩家名], [对应数据], [序号，1-100]",
    argList: ["cs", "ar", "od", "hp", "stars", "length", "aim", "spd", "acc", "pp"],
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            const type = args[1];
            const number = parseInt(args[2]);
            if (!user || !type || !number || module.exports.argList.indexOf(type) < 0) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo + "\n数据有：" + module.exports.argList.join("、");
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            const statTypes = ["cs", "ar", "od", "hp", "stars", "applength"]; // 对象属性
            const statKeywords = ["cs", "ar", "od", "hp", "stars", "length"]; // 输入的字符
            const ppTypes = ["aim", "speed", "acc", "total"]; // 对象属性
            const ppKeywords = ["aim", "spd", "acc", "pp"];  // 输入的字符
            const length = exScoreObjects.length;
            let data = [];
            let keywordIndex = statKeywords.indexOf(type);
            if (keywordIndex >= 0) {
                for (let i = 0; i < length; i++) {
                    data.push({ val: exScoreObjects[i][statTypes[keywordIndex]], score: exScoreObjects[i] });
                }
            }
            else {
                keywordIndex = ppKeywords.indexOf(type);
                if (keywordIndex >= 0) {
                    for (let i = 0; i < length; i++) {
                        data.push({ val: exScoreObjects[i].pp[ppTypes[keywordIndex]], score: exScoreObjects[i] });
                    }
                }
                else return "限定数据：" + statKeywords.join("、") + "；" + ppKeywords.join("、");
            }
            // 排序
            data = data.sort((a, b) => b.val - a.val);
            if (number < 1 || number > length) return "请输入序号：1~" + length;
            return type + "#" + number + ":\n" + data[number - 1].score.toString();
        }
        catch (ex) {
            return ex;
        }
    }
};
