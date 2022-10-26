const querystring = require("querystring");
const fetch = require("node-fetch");
class OsuApi {
    static async apiCall(_path, _data, _host, times = 0) {
        const MAX_RETRY = 10;
        try {
            const contents = querystring.stringify(_data);
            const url = "https://" + _host + "/api" + _path + "?" + contents;
            // console.log(url);
            const data = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/octet-stream" },
                credentials: "include",
                timeout: 10000,
            }).then((res) => res.json());
            if (!data) return { code: "error" };
            const dataString = JSON.stringify(data);
            if (dataString === "[]" || dataString === "{}") return { code: 404 };
            return data;
        }
        catch (ex) {
            if (times >= MAX_RETRY) {
                console.log("获取bp列表时超过最大重试次数，停止获取");
                return { code: "error" };
            }
            console.log("获取bp列表失败，第" + (times + 1) + "次重试");
            return this.apiCall(_path, _data, _host, times + 1);
        }
    }
    static async getUserStdBp(user, host, apiKey) {
        const options = {};
        options.u = user;
        options.k = apiKey;
        options.m = "0";
        options.limit = "100";
        const resp = await this.apiCall("/get_user_best", options, host);
        return resp;
    }
}
module.exports = OsuApi;
