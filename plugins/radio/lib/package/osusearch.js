"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsusearchApi = void 0;
const querystring_1 = require("querystring");
const https_1 = require("https");
const axios_1 = __importDefault(require("axios"));
const { create } = axios_1.default;
const axiosRu = create({
    httpsAgent: new https_1.Agent({
        rejectUnauthorized: false
    })
});
class OsusearchApi {
    static async apiRequest(options) {
        const contents = (options) ? (0, querystring_1.stringify)(options) : '';
        const url = 'https://osusearch.com/query/?' + contents;
        const result = await axiosRu.get(url);
        return result.data;
    }
    static findMostSuitable(result, params) {
        // 为防止搜索Insane难度返回someone's Insane这种情况，优先选择完全匹配的
        if (params.diff_name) {
            const diffResult = result.filter((beatmap) => {
                return (beatmap.difficulty_name.toLowerCase() === params.diff_name.toLowerCase());
            });
            if (diffResult.length <= 0)
                return result[0];
            return diffResult[0];
        }
        else
            return result[0];
    }
    static async doSearch(_data) {
        const params = {};
        if (_data.title)
            params.title = _data.title;
        if (_data.artist)
            params.artist = _data.artist;
        if (_data.mapper)
            params.mapper = _data.mapper;
        if (_data.diff_name)
            params.diff_name = _data.diff_name;
        // if (_data.modes) params.modes = _data.modes; //Standard/Taiko/CtB/Mania
        params.query_order = 'play_count';
        try {
            const result = await this.apiRequest(params);
            if (!result)
                return { code: 'error', message: '搜索谱面失败' };
            if (result.result_count === 0)
                return { code: 404, message: '找不到任何谱面（' + JSON.stringify(params) + '）' };
            if (result.beatmaps.length > 1)
                return this.findMostSuitable(result.beatmaps, params);
            return result.beatmaps[0];
        }
        catch (ex) {
            console.log('[osusearch] ' + ex);
            return { code: 'error', message: '搜索谱面出错' };
        }
    }
    /**
       * osusearch搜索谱面
       * @returns {number | {code: number | string, message: string}} 返回id，出错时返回 {code: "error"} 或 {code: 404}
       */
    static async search(data, type = 'set') {
        const result = await this.doSearch(data);
        if (result.code)
            return result;
        if (type === 'id')
            return result.beatmap_id;
        else
            return result.beatmapset_id;
    }
}
exports.OsusearchApi = OsusearchApi;
