"use strict";

const querystring = require('querystring');
const fetch = require('node-fetch');

// 参考了白菜的源码：https://github.com/Mother-Ship/cabbageWeb/
// 考虑到访问速度，只用于通过搜索获取谱面id，按谱面id获取谱面信息时还是用osu api
class OsusearchApi {
    static async apiRequest(options) {
        try {
            const contents = (options) ? querystring.stringify(options) : "";
            const url = "https://osusearch.com/query/?" + contents;
            return await fetch(url).then(res => res.json());
        }
        catch (ex) {
            console.log("（不会发送给机器人）--------------\n" + ex + "\n--------------");
            return { code: "error" };
        }
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
        const result = await this.apiRequest(params);
        try {
            if (!result || result.code === "error") return { code: "error" };
            if (result.result_count === 0) return { code: 404 };
            if (result.beatmaps.length > 1) return this.findtheMostSuitable(result.beatmaps, params);
            return result.beatmaps[0];
        }
        catch (ex) {
            console.log(ex);
            return { code: "error" };
        }
    }


    static async search(_data, type = "id") {
        let result = await this.doSearch(_data);
        if (result.code) return result;
        if (type === "set") return result.beatmapset_id;
        else return result.beatmap_id;
    }



}

module.exports = OsusearchApi;
