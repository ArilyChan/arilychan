
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "per",
    info: "pp分配",
    command: ["per"],
    argsInfo: "[玩家名]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            // 计算每张图pp分配，找出3维各自最大比重的那张图
            // 计算总3维和总pp，统计3维总共占百分比
            const length = exScoreObjects.length;
            let maxAimPer = 0;
            let maxAimBeatmapTitle = "";
            let maxSpdPer = 0;
            let maxSpdBeatmapTitle = "";
            let maxAccPer = 0;
            let maxAccBeatmapTitle = "";
            let totalAim = 0;
            let totalSpd = 0;
            let totalAcc = 0;
            let totalPP = 0;
            for (let i = 0; i < length; i++) {
                const aimPer = exScoreObjects[i].pp.aim / exScoreObjects[i].pp.total;
                totalAim += exScoreObjects[i].pp.aim;
                if (aimPer > maxAimPer) {
                    maxAimPer = aimPer;
                    maxAimBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                const spdPer = exScoreObjects[i].pp.speed / exScoreObjects[i].pp.total;
                totalSpd += exScoreObjects[i].pp.speed;
                if (spdPer > maxSpdPer) {
                    maxSpdPer = spdPer;
                    maxSpdBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                const accPer = exScoreObjects[i].pp.acc / exScoreObjects[i].pp.total;
                totalAcc += exScoreObjects[i].pp.acc;
                if (accPer > maxAccPer) {
                    maxAccPer = accPer;
                    maxAccBeatmapTitle = exScoreObjects[i].beatmapTitle;
                }
                totalPP += exScoreObjects[i].pp.total;
            }
            let output = "\n最高Aim比例：" + (maxAimPer * 100).toFixed(1) + "%，谱面：" + maxAimBeatmapTitle;
            output += "\n最高Speed比例：" + (maxSpdPer * 100).toFixed(1) + "%，谱面：" + maxSpdBeatmapTitle;
            output += "\n最高Acc比例：" + (maxAccPer * 100).toFixed(1) + "%，谱面：" + maxAccBeatmapTitle;
            output += "\n所有bp Aim所占比：" + (totalAim * 100 / totalPP).toFixed(1) + "%";
            output += "\n所有bp Speed所占比：" + (totalSpd * 100 / totalPP).toFixed(1) + "%";
            output += "\n所有bp Acc所占比：" + (totalAcc * 100 / totalPP).toFixed(1) + "%";
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
};
