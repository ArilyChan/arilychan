
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "pp",
    info: "totalpp查询",
    command: ["pp"],
    argsInfo: "[玩家名]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            // 统计出pp区间，最大最小值并绘图
            // 计算每张图pp-fc pp、pp-ss pp，列出提升空间最大的图
            const length = exScoreObjects.length;
            let maxPP = 0;
            let minPP = Infinity;
            let totalPP = 0;
            let maxPPVSFC = 0;
            let maxPPVSSS = 0;
            let maxFCImpPPBeatmapTitle = "";
            let maxSSImpPPBeatmapTitle = "";
            for (let i = 0; i < length; i++) {
                const pp = exScoreObjects[i].pp.total;
                const ppFC = exScoreObjects[i].fcpp.total;
                const ppSS = exScoreObjects[i].sspp.total;
                const ppVSFC = ppFC - pp;
                const ppVSSS = ppSS - pp;
                if (pp > maxPP) maxPP = pp;
                if (pp < minPP) minPP = pp;
                totalPP += pp;
                if (ppVSFC > maxPPVSFC) {
                    maxPPVSFC = ppVSFC;
                    maxFCImpPPBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                if (ppVSSS > maxPPVSSS) {
                    maxPPVSSS = ppVSSS;
                    maxSSImpPPBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
            }
            let output = "\nPP区间：" + minPP.toFixed(0) + "~" + maxPP.toFixed(0) + "，平均值：" + (totalPP / length).toFixed(0);
            output += "\n如果FC，PP可以提升最大：" + maxPPVSFC.toFixed(0) + "，谱面：" + maxFCImpPPBeatmapTitle;
            output += "\n如果SS，PP可以提升最大：" + maxPPVSSS.toFixed(0) + "，谱面：" + maxSSImpPPBeatmapTitle;
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
};
