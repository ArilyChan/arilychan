"use strict";

const ScoreObject = require("./objects/ScoreObject");
const OsuApi = require("./ApiRequest");
const utils = require("./utils");

class getScoreData {
    constructor(host, apiKey, apiObjects, isTop) {
        this.host = host;
        this.apiKey = apiKey;
        this.apiObjects = apiObjects;
        this.isTop = isTop;
    }

    async getScoreObjects(argObject) {
        const result = await OsuApi.getScores(argObject, this.host, this.apiKey);
        if (result.code === 404) throw "找不到成绩 " + utils.apiObjectToString(argObject);
        if (result.code === "error") throw "获取成绩出错 " + utils.apiObjectToString(argObject);
        if ((!Array.isArray(result)) || (result.length <= 0)) throw "找不到成绩 " + utils.apiObjectToString(argObject);
        let scoreObjects = result.map(item => { return new ScoreObject(item, argObject.b); });
        return scoreObjects;
    }

    async output() {
        try {
            let argObject = this.apiObjects[0];
            if (this.isTop) argObject.limit = 1; // limit = 1 即为最高pp
            let scoreObjects = await this.getScoreObjects(argObject);
            let output = "";
            // output = output + scoreObjects[0].toCompleteString(parseInt(argObject.m));
            output = output + await scoreObjects[0].toCompleteString(parseInt(argObject.m), true);
            return output;
        }
        catch (ex) {
            return ex;
        }
    }

}


module.exports = getScoreData;