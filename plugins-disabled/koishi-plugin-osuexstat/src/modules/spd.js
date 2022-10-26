
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "spd",
    info: "spd查询",
    command: ["spd"],
    argsInfo: "[玩家名]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            // 统计出spd区间，最大最小值并绘图
            // 计算每张图spd-fc spd、spd-ss spd，列出提升空间最大的图
            const length = exScoreObjects.length;
            let maxSpd = 0;
            let minSpd = Infinity;
            let maxSpdBeatmapTitle = "";
            let totalSpd = 0;
            let maxSpdVSFC = 0;
            let maxSpdVSSS = 0;
            let maxFCImpSpdBeatmapTitle = "";
            let maxSSImpSpdBeatmapTitle = "";
            for (let i = 0; i < length; i++) {
                const speed = exScoreObjects[i].pp.speed;
                const speedFC = exScoreObjects[i].fcpp.speed;
                const speedSS = exScoreObjects[i].sspp.speed;
                const speedVSFC = speedFC - speed;
                const speedVSSS = speedSS - speed;
                if (speed > maxSpd) {
                    maxSpd = speed;
                    maxSpdBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                if (speed < minSpd) minSpd = speed;
                totalSpd += speed;
                if (speedVSFC > maxSpdVSFC) {
                    maxSpdVSFC = speedVSFC;
                    maxFCImpSpdBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                if (speedVSSS > maxSpdVSSS) {
                    maxSpdVSSS = speedVSSS;
                    maxSSImpSpdBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
            }
            let output = "\nSpeed区间：" + minSpd.toFixed(0) + "~" + maxSpd.toFixed(0) + "，平均值：" + (totalSpd / length).toFixed(0);
            output += "\nSpeed最高谱面：" + maxSpdBeatmapTitle;
            output += "\n如果FC，Speed可以提升最大：" + maxSpdVSFC.toFixed(0) + "，谱面：" + maxFCImpSpdBeatmapTitle;
            output += "\n如果SS，Speed可以提升最大：" + maxSpdVSSS.toFixed(0) + "，谱面：" + maxSSImpSpdBeatmapTitle;
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
};
