"use strict";

const querystring = require('querystring');
const fetch = require('node-fetch');

class OsuApi {
    static async apiCall(_path, _data, _host) {
        try {
            const contents = querystring.stringify(_data);
            const url = "https://" + _host + "/api" + _path + '?' + contents;
            // console.log(url);
            const data = await fetch(url).then(res => res.json());
            if (!data) return { code: "error" };
            const dataString = JSON.stringify(data);
            if (dataString === "[]" || dataString === "{}") return { code: 404 };
            return data;
        }
        catch (ex) {
            console.log("（不会发送给机器人）--------------\n" + ex + "\n--------------");
            return { code: "error" };
        }
    }

    static async getBeatmaps(options, host) {
        const resp = await this.apiCall('/get_beatmaps', options, host);
        return resp;
    }

    static async getUser(options, host) {
        const resp = await this.apiCall('/get_user', options, host);
        return resp;
    }

    static async getScores(options, host) {
        const resp = await this.apiCall('/get_scores', options, host);
        return resp;
    }

    static async getUserBest(options, host) {
        const resp = await this.apiCall('/get_user_best', options, host);
        return resp;
    }

    static async getUserRecent(options, host) {
        const resp = await this.apiCall('/get_user_recent', options, host);
        return resp;
    }

    static async getUserRecentRx(options, host) {
        const resp = await this.apiCall('/get_user_rxrecent', options, host);
        return resp;
    }
}

module.exports = OsuApi;
