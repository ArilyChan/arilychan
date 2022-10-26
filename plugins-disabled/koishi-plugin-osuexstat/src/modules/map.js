
const GetBestScoresData = require("../getBestScoresData");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "map",
    info: "四维查询",
    command: ["map"],
    argsInfo: "[玩家名]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            // 分别统计四维和谱面难度，计算各自平均数
            const length = exScoreObjects.length;
            let maxCS = -Infinity;
            let minCS = Infinity;
            let totalCS = 0;
            let maxAR = -Infinity;
            let minAR = Infinity;
            let totalAR = 0;
            let maxOD = -Infinity;
            let minOD = Infinity;
            let totalOD = 0;
            let maxHP = -Infinity;
            let minHP = Infinity;
            let totalHP = 0;
            let maxStars = 0;
            let minStars = Infinity;
            let totalStars = 0;
            let maxLength = 0;
            let minLength = Infinity;
            let totalLength = 0;
            for (let i = 0; i < length; i++) {
                const cs = exScoreObjects[i].cs;
                const ar = exScoreObjects[i].ar;
                const od = exScoreObjects[i].od;
                const hp = exScoreObjects[i].hp;
                const stars = exScoreObjects[i].stars;
                const applength = exScoreObjects[i].applength;
                if (cs > maxCS) maxCS = cs;
                if (cs < minCS) minCS = cs;
                totalCS += cs;
                if (ar > maxAR) maxAR = ar;
                if (ar < minAR) minAR = ar;
                totalAR += ar;
                if (od > maxOD) maxOD = od;
                if (od < minOD) minOD = od;
                totalOD += od;
                if (hp > maxHP) maxHP = hp;
                if (hp < minHP) minHP = hp;
                totalHP += hp;
                if (stars > maxStars) maxStars = stars;
                if (stars < minStars) minStars = stars;
                totalStars += stars;
                if (applength > maxLength) maxLength = applength;
                if (applength < minLength) minLength = applength;
                totalLength += applength;
            }
            let output = "\nCS区间：" + minCS.toFixed(1) + "~" + maxCS.toFixed(1) + "，平均值：" + (totalCS / length).toFixed(1);
            output += "\nAR区间：" + minAR.toFixed(1) + "~" + maxAR.toFixed(1) + "，平均值：" + (totalAR / length).toFixed(1);
            output += "\nOD区间：" + minOD.toFixed(1) + "~" + maxOD.toFixed(1) + "，平均值：" + (totalOD / length).toFixed(1);
            output += "\nHP区间：" + minHP.toFixed(1) + "~" + maxHP.toFixed(1) + "，平均值：" + (totalHP / length).toFixed(1);
            output += "\n难度区间：" + minStars.toFixed(2) + "★~" + maxStars.toFixed(2) + "★，平均值：" + (totalStars / length).toFixed(2) + "★";
            output += "\n长度（非精确）区间：" + minLength + "秒~" + maxLength + "秒，平均值：" + (totalLength / length).toFixed(1) + "秒";
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
};
