
const GetBestScoresData = require("../getBestScoresData");
const Chart = require("lchart");
module.exports = {
    enabled: true,
    adminCommand: false,
    type: "date",
    info: "bp时间分布",
    command: ["date"],
    argsInfo: "[玩家名], [时区，不写默认+8]",
    call: async (host, apiKey, saveDir, downloader, args) => {
        try {
            const user = args[0];
            const timezoneOffsetHours = parseInt(args[1]) || 8;
            if (!timezoneOffsetHours) return "请输入正确的时区，默认为+8";
            if (!user) throw "格式不正确\n请输入exbp " + module.exports.command[0] + ", " + module.exports.argsInfo;
            const exScoreObjects = await new GetBestScoresData(host, apiKey, user, saveDir).getBestScoresObject(downloader);
            const length = exScoreObjects.length;
            let data = [];
            for (let i = 0; i < length; i++) {
                const time = exScoreObjects[i].time;
                let localHours = (time.getUTCHours() + timezoneOffsetHours) % 24;
                if (localHours < 0) localHours += 24;
                const SecondsInDay = localHours * 3600 + time.getUTCMinutes() * 60 + time.getUTCSeconds();
                data.push({ pp: exScoreObjects[i].pp.total, time: SecondsInDay });
            }
            data = data.sort((a, b) => a.time - b.time);
            const points = data.map((d) => {
                return { x: d.time / 3600, y: d.pp };
            });
            const chart = new Chart([{
                points, configs: {
                    lineColor: "#ff9898",
                    pointFillColor: "#ff5757"
                }
            }], {
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
                    titleX: "time",
                    titleY: "pp",
                    divideX: 50,
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
