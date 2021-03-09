
const GetBestScoresData = require("../getBestScoresData");
const Chart = require("lchart");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "chartc",
    info: "Ifpp比较",
    command: ["chartc"],
    argsInfo: "[玩家名], [对应数据]",
    argList: ["aim", "spd", "acc", "pp"],
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            const type = args[1];
            if (!user || !type || module.exports.argList.indexOf(type) < 0) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo + "\n数据有：" + module.exports.argList.join("、");
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            const ppTypes = ["aim", "speed", "acc", "total"]; // 对象属性
            const ppKeywords = ["aim", "spd", "acc", "pp"];  // 输入的字符
            const length = exScoreObjects.length;
            const ppkeywordIndex = ppKeywords.indexOf(type);
            if (ppkeywordIndex < 0) return "限定数据：" + ppKeywords.join("、");
            let pp = [];
            let fcpp = [];
            let sspp = [];
            for (let i = 0; i < length; i++) {
                pp.push(exScoreObjects[i].pp[ppTypes[ppkeywordIndex]]);
                fcpp.push(exScoreObjects[i].fcpp[ppTypes[ppkeywordIndex]]);
                sspp.push(exScoreObjects[i].sspp[ppTypes[ppkeywordIndex]]);
            }
            pp = pp.sort((a, b) => b - a);
            fcpp = fcpp.sort((a, b) => b - a);
            sspp = sspp.sort((a, b) => b - a);
            const xLabel = new Array(length);
            for (let i = 0; i < length; ++i) {
                xLabel[i] = i + 1;
            }
            const points_pp = pp.map((d, index) => {
                return { x: index + 1, y: d };
            });
            const points_fcpp = fcpp.map((d, index) => {
                return { x: index + 1, y: d };
            });
            const points_sspp = sspp.map((d, index) => {
                return { x: index + 1, y: d };
            });
            const chart = new Chart([{ name: "If SS " + ppTypes[ppkeywordIndex], points: points_sspp }, { name: "If FC " + ppTypes[ppkeywordIndex], points: points_fcpp }, { name: ppTypes[ppkeywordIndex], points: points_pp }], {
                padding: {
                    up: 100,
                    down: 80,
                    left: 100,
                    right: 100
                },
                color: {
                    background: "white",
                    title: "#000000",
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
                    title: user,
                    titleY: type,
                    divideX: 10,
                    divideY: 20
                },
                // font: "15px 宋体",
                // xDateMode: true,
                // xDateLabel: xLabel,
            });
            const picUrl = chart.draw();
            const base64 = picUrl.substring(picUrl.indexOf(",") + 1);
            return `[CQ:image,file=base64://${base64}]`;
        }
        catch (ex) {
            return ex;
        }
    }
};
