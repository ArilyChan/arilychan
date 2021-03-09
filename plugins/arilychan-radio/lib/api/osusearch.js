"use strict";

const querystring = require('querystring');
const fetch = require('node-fetch');

/*
class OsusearchBeatmap {
    constructor(searchResult) {
        this.artist = searchResult.artist;
        this.beatmap_id = searchResult.beatmap_id; // osu beatmap_id
        this.beatmap_status = searchResult.beatmap_status;
        this.beatmapset = searchResult.beatmapset;
        this.beatmapset_id = searchResult.beatmapset_id; // osu beatmapset_id 
        this.bpm = searchResult.bpm;
        this.date = new Date(searchResult.date);
        this.difficulty = searchResult.difficulty;
        this.difficulty_ar = searchResult.difficulty_ar;
        this.difficulty_cs = searchResult.difficulty_cs;
        this.difficulty_hp = searchResult.difficulty_hp;
        this.difficulty_name = searchResult.difficulty_name;
        this.difficulty_od = searchResult.difficulty_od;
        this.favorites = searchResult.favorites;
        this.gamemode = searchResult.gamemode;
        this.genre = searchResult.genre;
        this.ignored = searchResult.ignored;
        this.language = searchResult.language;
        this.map_count = searchResult.map_count;
        this.mapper = searchResult.mapper;
        this.pass_count = searchResult.pass_count;
        this.play_count = searchResult.play_count;
        this.play_length = searchResult.play_length;
        this.source = searchResult.source;
        this.title = searchResult.title;
        this.total_length = searchResult.total_length;
    }
}
*/

class OsusearchApi {
    static async apiRequest(options) {
        const contents = (options) ? querystring.stringify(options) : "";
        const url = "https://osusearch.com/query/?" + contents;
        return await fetch(url).then(res => res.json());
    }

    static findtheMostSuitable(result, params) {
        // 为防止搜索Insane难度返回someone's Insane这种情况，优先选择完全匹配的
        if (params.diff_name) {
            let diff_result = result.filter((beatmap) => {
                return (beatmap.difficulty_name.toLowerCase() === params.diff_name.toLowerCase());
            });
            if (diff_result.length <= 0) return result[0];
            return diff_result[0];
        }
        else return result[0];
    }

    static async doSearch(_data) {
        let params = {};
        if (_data.title) params.title = _data.title;
        if (_data.artist) params.artist = _data.artist;
        if (_data.mapper) params.mapper = _data.mapper;
        if (_data.diff_name) params.diff_name = _data.diff_name;
        // if (_data.modes) params.modes = _data.modes; //Standard/Taiko/CtB/Mania
        params.query_order = "play_count";
        try {
            const result = await this.apiRequest(params);
            if (!result) return { code: "error", message: "搜索谱面失败" };
            if (result.result_count === 0) return { code: 404, message: "找不到任何谱面（" + JSON.stringify(params) + "）" };
            if (result.beatmaps.length > 1) return this.findtheMostSuitable(result.beatmaps, params);
            return result.beatmaps[0];
        }
        catch (ex) {
            console.log("[osusearch] " + ex);
            return { code: "error", message: "搜索谱面出错" };
        }
    }

    /**
     * osusearch搜索谱面
     * @param {Object} data 
     * @param {String} [data.title]
     * @param {String} [data.artist]
     * @param {String} [data.mapper]
     * @param {String} [data.diff_name]
     * @param {"set"|"id"} [type] 返回setId还是beatmapId
     * @returns {Number|{code, message}} 返回id，出错时返回 {code: "error"} 或 {code: 404} 
     */
    static async search(data, type = "set") {
        let result = await this.doSearch(data);
        if (result.code) return result;
        if (type === "id") return result.beatmap_id;
        else return result.beatmapset_id;
    }



}

module.exports = OsusearchApi;