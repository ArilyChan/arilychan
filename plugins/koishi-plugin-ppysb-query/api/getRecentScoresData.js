"use strict";

const ScoreObject = require("./objects/ScoreObject");
const RippleApi = require("./RippleApiRequest");
const getUserData = require("./getUserData");
const utils = require("./utils");

class getRecentScoresData {
    constructor(exscore, host, apiObjects, isRX, isPassed) {
        this.exscore = exscore;
        this.host = host;
        this.apiObject = (Array.isArray(apiObjects)) ? apiObjects[0] : apiObjects; // 只允许查一个人
        this.isRX = isRX;
        this.isPassed = isPassed;
    }

    async getRecentScoresObject(simpleUserObject) {
        const result = (this.isRX) ? await RippleApi.getRecentRx(this.apiObject, this.host) : await RippleApi.getRecent(this.apiObject, this.host);
        if (result.code === 404) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject);
        if (result.code === 400) throw "必须指定玩家名或Id（或先setid绑定私服账户）";
        if (result.code === "error") throw "获取成绩出错 " + utils.apiObjectToString(this.apiObject);
        let scores = result.scores;
        if ((!Array.isArray(scores)) || (scores.length <= 0)) throw "找不到成绩 " + utils.apiObjectToString(this.apiObject) + "\n";
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

    async output() {
        try {
            if (!this.isPassed) this.apiObject.limit = 1;
            let simpleUserObject = await this.getSimpleUserObject();
            let scoreObjects = await this.getRecentScoresObject(simpleUserObject);
            if (this.isPassed) {
                let output = "";
                // 寻找completed标签>0的
                for (var i = 0; i < scoreObjects.length; i++) {
                    if (scoreObjects[i].completed > 0) {
                        output = output + scoreObjects[i].beatmap.toScoreTitle(scoreObjects[i].mode);
                        output = output + await scoreObjects[i].toCompleteString(this.exscore);
                        return output;
                    }
                }
                return "找不到最近的pass成绩";
            }
            else {
                let scoreObject = scoreObjects.pop();
                let output = "";
                output = output + scoreObject.beatmap.toScoreTitle(scoreObject.mode);
                output = output + await scoreObject.toCompleteString(this.exscore);
                return output;
            }
        }
        catch (ex) {
            return ex;
        }
    }
}


module.exports = getRecentScoresData;