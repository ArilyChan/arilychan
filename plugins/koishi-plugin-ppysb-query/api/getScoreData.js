"use strict";

const ScoreObject = require("./objects/ScoreObject");
const getBeatmapData = require("./getBeatmapData");
const RippleApi = require("./RippleApiRequest");
const utils = require("./utils");

// 用ripple获取玩家成绩
// api暂不能获取rx模式成绩！！
class getScoreData {
    constructor(exscore, host, apiObjects, isRX, isTop, isVsTop, isTops) {
        this.exscore = exscore;
        this.host = host;
        this.apiObjects = apiObjects;
        this.isRX = isRX;
        this.isTop = isTop;
        this.isVsTop = isVsTop;
        this.isTops = isTops;
    }

    async getScoreObjects(argObject, beatmapObject) {
        const result = await RippleApi.getScores(argObject, this.host);
        if (result.code === 404) throw "找不到成绩 " + utils.apiObjectToString(argObject);
        if (result.code === "error") throw "获取成绩出错 " + utils.apiObjectToString(argObject);
        let scores = result.scores;
        if ((!Array.isArray(scores)) || (scores.length <= 0)) throw "找不到成绩 " + utils.apiObjectToString(argObject);
        let scoreObjects = scores.map(item => { return new ScoreObject(item, beatmapObject, null); });
        return scoreObjects;
    }

    async getBeatmapObject() {
        // 获取beatmapObject
        let argObject = this.apiObjects[0];
        let beatmapArgObject = {};
        beatmapArgObject.b = argObject.b;
        if (argObject.m) beatmapArgObject.m = argObject.m;
        if (argObject.a) beatmapArgObject.a = argObject.a;
        return await new getBeatmapData(this.host, beatmapArgObject).getBeatmapObject();
    }

    /**
     * 从结果中寻找指定玩家成绩
     * @param {Array<ScoreObject>} scoreObjects 
     * @param {Array<String>} userIds id或name的字符串格式
     * @returns {ScoreObject|null}
     */
    searchUsersScore(scoreObjects, userIds) {
        let searchResult = [];
        // 全部统一成小写字母形式
        let userIdNames = userIds.map((userId) => {
            return userId.toString().toLowerCase();
        });
        for (var i = 0; i < scoreObjects.length; i++) {
            let thisScoreUserId = scoreObjects[i].user.userId.toString();
            let thisScoreUserName = scoreObjects[i].user.username.toLocaleLowerCase();
            let findIndex = userIdNames.indexOf(thisScoreUserId);
            let findIndex2 = userIdNames.indexOf(thisScoreUserName);
            if (findIndex >= 0) {
                searchResult.push(scoreObjects[i]);
                userIdNames.splice(findIndex, 1);
                if (findIndex2 >= 0) userIdNames.splice(findIndex2, 1); // 防userIds重复
            }
            else if (findIndex2 >= 0) {
                searchResult.push(scoreObjects[i]);
                if (findIndex >= 0) userIdNames.splice(findIndex, 1); // 防userIds重复
                userIdNames.splice(findIndex2, 1);
            }
            if (userIdNames.length <= 0) break;
        }
        return searchResult;
    }

    async outputTopScore() {
        try {
            let beatmapObject = await this.getBeatmapObject();
            // limit = 1 即为最高pp
            let argObject = this.apiObjects[0];
            argObject.limit = 1;
            let scoreObjects = await this.getScoreObjects(argObject, beatmapObject);
            let output = "";
            output = output + beatmapObject.toScoreTitle(scoreObjects[0].mode);
            output = output + await scoreObjects[0].toCompleteString(this.exscore);
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

    async outputTopsScore() {
        try {
            let beatmapObject = await this.getBeatmapObject();
            // limit = 10 取前10个成绩
            let argObject = this.apiObjects[0];
            argObject.limit = 10;
            let scoreObjects = await this.getScoreObjects(argObject, beatmapObject);
            if (scoreObjects.length <= 0) return "这个谱面还没有人上传过成绩";
            let output = "";
            output = output + beatmapObject.toScoreTitle(scoreObjects[0].mode);
            if (scoreObjects.length === 1) output = output + await scoreObjects[0].toCompleteString(this.exscore);
            else {
                scoreObjects.map((scoreObject) => {
                    output = output + scoreObject.toString() + "\n";
                });
            }
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

    async output() {
        try {
            if (this.isTop) return this.outputTopScore();
            if (this.isTops) return this.outputTopsScore();
            let userIds = this.apiObjects.map((apiObject) => {
                return apiObject.u;
            });
            let beatmapObject = await this.getBeatmapObject();
            let scoreObjects = await this.getScoreObjects(this.apiObjects[0], beatmapObject);
            if (this.isVsTop) userIds.push(scoreObjects[0].user.userId.toString());
            // 如果scoreObjects每个玩家成绩唯一，即使userIds有重复也不会输出重复成绩的
            let searchResult = this.searchUsersScore(scoreObjects, userIds);
            if (searchResult.length <= 0) return "没找到指定玩家的成绩";
            let output = "";
            output = output + beatmapObject.toScoreTitle(scoreObjects[0].mode);
            if (searchResult.length === 1) output = output + await searchResult[0].toCompleteString(this.exscore);
            else {
                searchResult.map((scoreObject) => {
                    output = output + scoreObject.toString() + "\n";
                });
            }
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

}


module.exports = getScoreData;