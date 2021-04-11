"use strict";

const BeatmapObject = require("./objects/BeatmapObject");
const OsuApi = require("./ApiRequest");
const utils = require("./utils");

class getBeatmapData {
    constructor(host, apiKey, apiObjects) {
        this.host = host;
        this.apiKey = apiKey;
        this.apiObject = (Array.isArray(apiObjects)) ? apiObjects[0] : apiObjects; // 只允许同时查一张谱面
    }

    async getBeatmapObject(mods = 0) {
        const beatmaps = await OsuApi.getBeatmaps(this.apiObject, this.host, this.apiKey);
        if (beatmaps.code === 404) throw "找不到谱面 " + utils.apiObjectToString(this.apiObject);
        if (beatmaps.code === "error") throw "获取谱面出错 " + utils.apiObjectToString(this.apiObject);
        if (beatmaps.length <= 0) throw "找不到谱面 " + utils.apiObjectToString(this.apiObject);
        return new BeatmapObject(beatmaps[0], mods);
    }

    async output() {
        try {
            let beatmapObject = await this.getBeatmapObject();
            return beatmapObject.toString();
        }
        catch (ex) {
            return ex;
        }
    }

    async outputPool(mods = 0) {
        try {
            let beatmapObject = await this.getBeatmapObject(mods);
            return beatmapObject.toPoolString();
        }
        catch (ex) {
            return ex;
        }
    }

    async outputPP(mods = 0) {
        try {
            let beatmapObject = await this.getBeatmapObject(mods);
            return beatmapObject.toPPString();
        }
        catch (ex) {
            return ex;
        }
    }

}


module.exports = getBeatmapData;