
const GetBestScoresData = require("../getBestScoresData");
const Chart = require("lchart");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "chart",
    info: "折线图",
    command: ["chart"],
    argsInfo: "[玩家名，多玩家以/分隔], [对应数据]",
    argList: ["cs", "ar", "od", "hp", "stars", "length", "aim", "spd", "acc", "pp"],
    getDrawData: (exScoreObjects, type) => {
        const statTypes = ["cs", "ar", "od", "hp", "stars", "applength"]; // 对象属性
        const statKeywords = ["cs", "ar", "od", "hp", "stars", "length"]; // 输入的字符
        const ppTypes = ["aim", "speed", "acc", "total"]; // 对象属性
        const ppKeywords = ["aim", "spd", "acc", "pp"];  // 输入的字符
        const length = exScoreObjects.length;
        let data = [];
        let keywordIndex = statKeywords.indexOf(type);
        if (keywordIndex >= 0) {
            for (let i = 0; i < length; i++) {
                data.push(exScoreObjects[i][statTypes[keywordIndex]]);
            }
        }
        else {
            keywordIndex = ppKeywords.indexOf(type);
            if (keywordIndex >= 0) {
                for (let i = 0; i < length; i++) {
                    data.push(exScoreObjects[i].pp[ppTypes[keywordIndex]]);
                }
            }
            else throw "限定数据：" + statKeywords.join("、") + "；" + ppKeywords.join("、");
        }
        // stars保留2位
        // data = data.map((num) => Math.round(num * 100) / 100);
        // 排序
        data = data.sort((a, b) => b - a);
        const points = data.map((d, index) => {
            return { x: index + 1, y: d };
        });
        return points;
    },
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const MAX_PLAYER_COUNT = 2;
            const users = args[0];
            const type = args[1];
            if (!users || !type || module.exports.argList.indexOf(type) < 0) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo + "\n数据有：" + module.exports.argList.join("、");
            const user = users.split(/\//);
            if (user.length < 1) throw "玩家名不正确，多玩家以/分隔";
            if (user.length > MAX_PLAYER_COUNT) throw "考虑到下载任务，暂时只支持" + MAX_PLAYER_COUNT + "个玩家对比";
            const drawDatas = [];
            for (let i = 0; i < user.length; i++) {
                const exScoreObjects = await new GetBestScoresData(host, apiKey, user[i], saveDir).getBestScoresObject(downloader);
                if (exScoreObjects) {
                    drawDatas.push({ "name": user[i], "points": module.exports.getDrawData(exScoreObjects, type) });
                    continue;
                }
                else break;
            }
            const chart = new Chart(drawDatas, {
                color: {
                    background: "white",
                    titleX: "#005cc5",
                    titleY: "#7d04c8",
                    coordinate: "#000000",
                    grid: "#999999"
                },
                size: {
                    width: 1024,
                    height: 768
                },
                label: {
                    titleY: type,
                    divideX: 10,
                    divideY: 20
                }
            });
            const picUrl = chart.draw();
            const base64 = picUrl.substring(picUrl.indexOf(",") + 1);
            return `[CQ:image,url=base64://${base64}]`;
        }
        catch (ex) {
            return ex;
        }
    }
};
