"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayobotApi = exports.SearchResult = exports.BeatmapsetInfo = void 0;
const querystring_1 = require("querystring");
const https_1 = require("https");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const { create } = axios_1.default;
const axiosRu = create({
    httpsAgent: new https_1.Agent({
        rejectUnauthorized: false
    })
});
class BeatmapsetInfo {
    constructor(data, SpecDiff = '') {
        this.artist = data.artist;
        this.artistU = (data.artistU) ? data.artistU : data.artist;
        this.title = data.title;
        this.titleU = (data.titleU) ? data.titleU : data.title;
        this.sid = data.sid;
        this.creator = data.creator;
        this.creator_id = data.creator_id;
        this.source = data.source;
        if (!data.bid_data.length)
            throw new Error('beatmapSet without beatmap?');
        let beatmap;
        if (SpecDiff) {
            beatmap = data.bid_data.find((bData) => {
                const version = bData.version.toLowerCase();
                const diff = SpecDiff.toLowerCase();
                return (version.indexOf(diff) >= 0);
            }) || data.bid_data.pop();
        }
        else {
            beatmap = data.bid_data.pop();
        }
        this.duration = beatmap.length;
        this.audioFileName = beatmap.audio; // 无音频则为""
        this.bgFileName = beatmap.bg; // 无背景图则为""
        this.thumbImg = `https://cdn.sayobot.cn:25225/beatmaps/${this.sid}/covers/cover.jpg`;
        this.previewMp3 = `https://cdn.sayobot.cn:25225/preview/${this.sid}.mp3`;
        this.fullMp3 = (this.audioFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.audioFileName}` : null;
        this.background = (this.bgFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.bgFileName}` : null;
        this.setLink = `https://osu.ppy.sh/beatmapsets/${this.sid}`;
        this.uuid = (0, uuid_1.v4)();
    }
    static hydrate(data) {
        return Object.setPrototypeOf(data, BeatmapsetInfo.prototype);
    }
    // eslint-disable-next-line no-use-before-define
    static assertDatabaseReady(input) {
        const scopeOK = (input.scope === 'guild' && Boolean(input.guildId)) ||
            input.scope === 'public';
        return scopeOK && Boolean(input.created);
    }
}
exports.BeatmapsetInfo = BeatmapsetInfo;
class SearchResult {
    constructor(result, SpecDiff) {
        this.status = result.status;
        if (this.status === 0) {
            this.beatmapInfo = new BeatmapsetInfo(result.data, SpecDiff);
        }
    }
    success() {
        return (this.status === 0);
    }
}
exports.SearchResult = SearchResult;
class sayobotApi {
    static async apiRequestV2(options) {
        const contents = (options) ? (0, querystring_1.stringify)(options) : '';
        const url = 'https://api.sayobot.cn/v2/beatmapinfo?' + contents;
        const result = await axiosRu.get(url);
        return result.data;
    }
    static async apiRequestList(keyword) {
        const url = 'https://api.sayobot.cn/beatmaplist?0=1&1=0&2=4&' + (0, querystring_1.stringify)({ 3: keyword });
        const result = await axiosRu.get(url);
        return result.data;
    }
    /**
       * sayobot搜索谱面信息
       * @param {Number} sid setId
       * @param {String} diffName 难度名，为了获取指定难度的音频
       * @returns {BeatmapsetInfo|{code, message}} 返回BeatmapInfo，出错时返回 {code: "error"} 或 {code: 404}
       */
    static async search(sid, diffName) {
        const params = { K: sid, T: 0 }; // T=1 匹配bid
        try {
            const result = await this.apiRequestV2(params);
            if (!result)
                return { code: 'error', message: '获取谱面详情失败' };
            const searchResult = new SearchResult(result, diffName);
            if (!searchResult.success())
                return { code: 404, message: '查不到该谱面信息（谱面setId：' + sid + '）' };
            return searchResult.beatmapInfo;
        }
        catch (ex) {
            console.log('[sayobot] ' + ex);
            return { code: 'error', message: '获取谱面详情出错' };
        }
    }
    /**
       * sayobot搜索谱面
       * @param {String} keyword
       * @returns {Number|{code, message}} 返回set id，出错时返回 {code: "error"} 或 {code: 404}
       */
    static async searchList(keyword) {
        try {
            const result = await this.apiRequestList(keyword);
            if (!result)
                return { code: 'error', message: '搜索谱面失败' };
            if (!result.data)
                return { code: 404, message: '找不到任何谱面（关键词：' + keyword + '）' };
            return result.data.pop().sid;
        }
        catch (ex) {
            console.log('[sayobot] ' + ex);
            return { code: 'error', message: '搜索谱面出错' };
        }
    }
}
exports.sayobotApi = sayobotApi;
