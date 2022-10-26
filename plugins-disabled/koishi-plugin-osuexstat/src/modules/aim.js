
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "aim",
    info: "aim查询",
    command: ["aim"],
    argsInfo: "[玩家名]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            // 统计出aim区间，最大最小值并绘图
            // 计算每张图aim-fc aim、aim-ss aim，列出提升空间最大的图
            const length = exScoreObjects.length;
            let maxAim = 0;
            let minAim = Infinity;
            let maxAimBeatmapTitle = "";
            let totalAim = 0;
            let maxAimVSFC = 0;
            let maxAimVSSS = 0;
            let maxFCImpAimBeatmapTitle = "";
            let maxSSImpAimBeatmapTitle = "";
            for (let i = 0; i < length; i++) {
                const aim = exScoreObjects[i].pp.aim;
                const aimFC = exScoreObjects[i].fcpp.aim;
                const aimSS = exScoreObjects[i].sspp.aim;
                const aimVSFC = aimFC - aim;
                const aimVSSS = aimSS - aim;
                if (aim > maxAim) {
                    maxAim = aim;
                    maxAimBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                if (aim < minAim) minAim = aim;
                totalAim += aim;
                if (aimVSFC > maxAimVSFC) {
                    maxAimVSFC = aimVSFC;
                    maxFCImpAimBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                if (aimVSSS > maxAimVSSS) {
                    maxAimVSSS = aimVSSS;
                    maxSSImpAimBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
            }
            let output = "\nAim区间：" + minAim.toFixed(0) + "~" + maxAim.toFixed(0) + "，平均值：" + (totalAim / length).toFixed(0);
            output += "\nAim最高谱面：" + maxAimBeatmapTitle;
            output += "\n如果FC，Aim可以提升最大：" + maxAimVSFC.toFixed(0) + "，谱面：" + maxFCImpAimBeatmapTitle;
            output += "\n如果SS，Aim可以提升最大：" + maxAimVSSS.toFixed(0) + "，谱面：" + maxSSImpAimBeatmapTitle;
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
};
