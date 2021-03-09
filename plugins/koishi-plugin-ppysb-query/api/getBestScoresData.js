"use strict";

const ScoreObject = require("./objects/ScoreObject");
const RippleApi = require("./RippleApiRequest");
const getUserData = require("./getUserData");
const utils = require("./utils");

class getBestScoresData {
    constructor(exscore, host, apiObjects, isRX, searchText = "") {
        this.exscore = exscore;
        this.host = host;
        this.apiObject = (Array.isArray(apiObjects)) ? apiObjects[0] : apiObjects; // 只允许查一个人
        this.isRX = isRX;
        this.searchText = searchText;
    }

    async getBestScoresObject(simpleUserObject) {
        const result = (this.isRX) ? await RippleApi.getBestsRx(this.apiObject, this.host) : await RippleApi.getBests(this.apiObject, this.host);
        if (result.code === 404) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject);
        if (result.code === 400) throw "必须指定玩家名或Id（或先setid绑定私服账户）";
        if (result.code === "error") throw "获取成绩出错 " + utils.apiObjectToString(this.apiObject);
        let scores = result.scores;
        if ((!Array.isArray(scores)) || (scores.length <= 0)) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject);
        let scoreObjects = scores.map(item => { return new ScoreObject(item, null, simpleUserObject); });
        return scoreObjects;
    }

    async getSimpleUserObject() {
        // 获取simpleUserObject
        let userArgObject = {};
        if (this.apiObject.u) userArgObject.u = this.apiObject.u;
        if (this.apiObject.type) userArgObject.type = this.apiObject.type;
        return await new getUserData(this.host, userArgObject, null).getSimpleUserObject();
    }

    async outputToday() {
        try {
            let today = new Date().getTime();
            let simpleUserObject = await this.getSimpleUserObject();
            // bp列表
            let output = "";
            let scoreObjects = await this.getBestScoresObject(simpleUserObject);
            let todayScoreObjects = scoreObjects.filter((scoreObject) => {
                return (today - scoreObject.getPlayedDate().getTime() < 24 * 3600 * 1000)
            });
            if (todayScoreObjects.length <= 0) return "您今天还没刷新bp呢（你气不气.wav）";
            let over15Count = 0;
            if (todayScoreObjects.length > 15) {
                over15Count = todayScoreObjects.length - 15;
                todayScoreObjects = todayScoreObjects.slice(0, 15);
            }
            todayScoreObjects.map((scoreObject) => {
                output = output + scoreObject.beatmap.toScoreTitle(scoreObject.mode);
                output = output + scoreObject.toString() + "\n";
            });
            if (over15Count > 0) output = output + "为防止文字过长，已省略剩余的 " + over15Count + " 个bp";
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

    async output() {
        try {
            let simpleUserObject = await this.getSimpleUserObject();
            if (this.apiObject.limit) {
                // 指定bp
                this.apiObject.p = this.apiObject.limit;
                this.apiObject.limit = 1;
                let scoreObjects = await this.getBestScoresObject(simpleUserObject);
                let scoreObject = scoreObjects[0];
                let output = "";
                output = output + scoreObject.beatmap.toScoreTitle(scoreObject.mode);
                output = output + await scoreObject.toCompleteString(this.exscore);
                return output;
            }
            else {
                // bp列表
                this.apiObject.limit = "5"; // 设置为bp5，以减轻获取工作
                let scoreObjects = await this.getBestScoresObject(simpleUserObject);
                let output = "";
                scoreObjects.map((scoreObject) => {
                    output = output + scoreObject.beatmap.toScoreTitle(scoreObject.mode);
                    output = output + scoreObject.toString() + "\n";
                });
                return output;
            }
        }
        catch (ex) {
            return ex;
        }
    }

    async getAllBestScoresObject(simpleUserObject) {
        const result = (this.isRX) ? await RippleApi.getBestsRxAll(this.apiObject, this.host) : await RippleApi.getBestsAll(this.apiObject, this.host);
        if (result.code === 404) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject);
        if (result.code === 400) throw "必须指定玩家名或Id（或先setid绑定私服账户）";
        if (result.code === "error") throw "获取成绩出错 " + utils.apiObjectToString(this.apiObject);
        let scores = result.scores;
        if ((!Array.isArray(scores)) || (scores.length <= 0)) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject);
        let scoreObjects = scores.map(item => { return new ScoreObject(item, null, simpleUserObject); });
        return scoreObjects;
    }

    async outputBpNumber() {
        try {
            let simpleUserObject = await this.getSimpleUserObject();
            // bp列表
            let output = "";
            let scoreObjects = await this.getAllBestScoresObject(simpleUserObject);
            let length = scoreObjects.length;
            let beatmapId = this.apiObject.b;
            for (let i = 0; i < length; i++) {
                if (beatmapId === scoreObjects[i].beatmap.beatmapId) {
                    output = output + scoreObjects[i].beatmap.toScoreTitle(scoreObjects[i].mode);
                    output = output + await scoreObjects[i].toCompleteString(this.exscore);
                    output = output + "\n该谱面是您的bp " + (i + 1).toString();
                    return output;
                }
            }
            // bp中找不到谱面，搜索searchText
            if (this.searchText) {
                for (let i = 0; i < length; i++) {
                    if (scoreObjects[i].beatmap.songName.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0) {
                        output = output + scoreObjects[i].beatmap.toScoreTitle(scoreObjects[i].mode);
                        output = output + await scoreObjects[i].toCompleteString(this.exscore);
                        output = output + "\n该谱面是您的bp " + (i + 1).toString();
                        return output;
                    }
                }
            }
            // bp中也没有
            output = output + "谱面id: " + this.apiObject.b + "\n";
            output = output + "在您的bp列表里找不到该谱面。";
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

    async outputRankNumber() {
        try {
            let simpleUserObject = await this.getSimpleUserObject();
            // bp列表
            let output = simpleUserObject.username + " 的成绩统计：\n";
            let scoreObjects = await this.getAllBestScoresObject(simpleUserObject);
            let rank_list = ["SSH", "SS", "SH", "S", "A", "B", "C", "D"];
            let rank_count = [0, 0, 0, 0, 0, 0, 0, 0];
            let length = scoreObjects.length;
            output = output + "获取到 " + length + " 个成绩\n";
            let maxpp = 0;
            let minpp = 0;
            let perfectcount = 0;
            let summary_mods = []; // {mod, count, maxpp}
            for (let i = 0; i < length; i++) {
                // 记录rank
                let rank = scoreObjects[i].rank;
                let rankIndex = rank_list.indexOf(rank);
                if (rankIndex < 0) { // 应该没有除rank_list之外的rank吧，这个只是以防万一
                    rank_list.push(rank);
                    rank_count.push(1);
                }
                else {
                    rank_count[rankIndex] = rank_count[rankIndex] + 1;
                }
                // 记录pp最大值和最小值，一般是按pp降序排列的，这个只是以防万一
                let pp = scoreObjects[i].pp;
                if (pp > maxpp) maxpp = pp;
                if (minpp === 0) minpp = pp;
                else if (pp < minpp) minpp = pp;
                // 记录mods，每种mod分开记录次数和最大pp
                let mods = utils.getScoreModsStringArray(scoreObjects[i].mods);
                mods.map((mod) => {
                    let summary_mods_Index = summary_mods.findIndex((value) => value.mod === mod);
                    if (summary_mods_Index < 0) {
                        let newmod = {
                            mod: mod,
                            count: 1,
                            maxpp: pp
                        };
                        summary_mods.push(newmod);
                    }
                    else {
                        summary_mods[summary_mods_Index].count += 1;
                        if (pp > summary_mods[summary_mods_Index].maxpp) summary_mods[summary_mods_Index].maxpp = pp;
                    }
                });
                if (scoreObjects[i].full_combo) perfectcount += 1;
            }
            for (let i = 0; i < rank_list.length; i++) {
                if (rank_count[i] > 0) output = output + rank_count[i] + " 个 " + rank_list[i] + "\n";
            }
            output = output + "mod统计：\n";
            summary_mods.sort((a, b) => b.count - a.count);
            for (let i = 0; i < summary_mods.length; i++) {
                output = output + summary_mods[i].count + " 个 " + summary_mods[i].mod + " ， 最高pp：" + summary_mods[i].maxpp.toFixed(0) + "\n";
            }
            output = output + "bp最高pp：" + maxpp.toFixed(0) + "\n";
            output = output + "bp最低pp：" + minpp.toFixed(0) + "\n";
            const aboveSCount = rank_count[0] + rank_count[1] + rank_count[2] + rank_count[3];
            const sbCount = aboveSCount - perfectcount;
            if (sbCount > 0) output = output + "其中有 " + sbCount + " 个S评级的成绩不是full combo";
            return output;
        }
        catch (ex) {
            return ex;
        }
    }
}


module.exports = getBestScoresData;