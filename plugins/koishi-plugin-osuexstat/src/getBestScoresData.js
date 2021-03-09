/* eslint-disable array-callback-return */
/* eslint-disable no-sync */
/* eslint-disable no-throw-literal */
const fs = require("fs");
const ScoreObject = require("./score/ScoreObject");
const OsuApi = require("./ApiRequest");
class getBestScoresData {
    constructor(host, apiKey, user, saveDir) {
        this.host = host;
        this.apiKey = apiKey;
        this.user = user;
        this.saveDir = saveDir;
    }
    async getBestScoresObject(downloader) {
        const result = await OsuApi.getUserStdBp(this.user, this.host, this.apiKey);
        if (result.code === 404) throw "查不到" + this.user + "的成绩";
        if (result.code === "error") throw "获取" + this.user + "的成绩出错";
        if ((!Array.isArray(result)) || (result.length <= 0)) throw "查不到" + this.user + "的成绩";
        const scoreObjects = result.map((item) => { return new ScoreObject(item, this.saveDir) });
        // 下载所有缺失谱面
        console.log("下载" + this.user + "的所有缺失谱面");
        const beatmapIds = [];
        scoreObjects.map((so) => {
            if (!fs.existsSync(so.beatmapFile)) beatmapIds.push(so.beatmap_id);
        });
        const downloadResult = await downloader.downloadQueue(beatmapIds);
        if (!downloadResult) throw "下载缺失谱面时出现问题";
        console.log("每张谱面数据处理");
        const exScoreObjects = await Promise.all(scoreObjects.map((item) => {
            return item.extendScore();
        }));
        return exScoreObjects;
    }
}

module.exports = getBestScoresData;
