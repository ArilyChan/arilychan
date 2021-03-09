"use strict";

const sayobot = require("../api/sayobot");
const osusearch = require("../api/osusearch");

class Arg {
    constructor(message) {
        this.message = message;
    }

    /**
     * 判断字符串是否为正整数
     * @param {String} s 
     * @returns {Boolean} 是正整数
     */
    checkInt(s) {
        var re = /^\d+$/;
        return (re.test(s));
    }

    /**
     * 判断字符串是否包含非ASCII字符
     * @param {String} s 
     * @returns {Boolean} 包含非ASCII字符
     */
    checkUnicode(s) {
        var re = /[^\x00-\x7F]+/;
        return (re.test(s));
    }

    /**
     * 获取搜索谱面参数
     * @param {String} s 1234567 或 "404" 或 artist - title(mapper)[diff_name]
     */
    getSearchData(s) {
        let data = {};
        // 检测unicode字符，如果有则使用sayabot搜索
        if (this.checkUnicode(s)) {
            data.sayoTitle = s;
            return data;
        }
        // 1234567
        if (this.checkInt(s)) {
            data.beatmapSet = parseInt(s);
            return data;
        }
        // "404"
        if ((s.length > 4) && (s.substring(0, 1) === "\"") && (s.substring(s.length - 1) === "\"")) {
            // 带引号强制字符串形式
            data.title = s.substring(1, s.length - 1);
            return data;
        }
        // artist - title(mapper)[diff_name]
        // 先取mapper，因为mapper名字里可能有-[]
        let mapperStart = s.lastIndexOf("(");
        let mapperEnd = s.lastIndexOf(")");
        if (mapperStart >= 0 && mapperEnd >= 0 && mapperEnd - mapperStart > 1) {
            data.mapper = s.substring(mapperStart + 1, mapperEnd).trim();
            s = s.substring(0, mapperStart) + s.substring(mapperEnd + 1);
        }
        // 取artist
        let artistEnd = s.indexOf("-");
        if (artistEnd >= 0) {
            data.artist = s.substring(0, artistEnd).trim();
            s = s.substring(artistEnd + 1)
        }
        // 取diff_name
        let diffStart = s.lastIndexOf("[");
        let diffEnd = s.lastIndexOf("]");
        if (diffStart >= 0 && diffEnd >= 0 && diffEnd - diffStart > 1) {
            data.diff_name = s.substring(diffStart + 1, diffEnd).trim();
            s = s.substring(0, diffStart) + s.substring(diffEnd + 1);
        }
        // 取title
        data.title = s.trim();
        return data;
    }

    async getBeatmapInfo() {
        if (!this.message) throw "请输入正确格式：artist - title(mapper)[diff_name] 或直接给出beatmapSetId，参数只有纯数字title请在前后加上双引号";
        let searchData = this.getSearchData(this.message);
        if (JSON.stringify(searchData) === "{}") throw "请输入正确格式：artist - title(mapper)[diff_name] 或直接给出beatmapSetId，参数只有纯数字title请在前后加上双引号";

        let beatmapSetId;

        // 直接给出setId
        if (searchData.beatmapSet) beatmapSetId = searchData.beatmapSet;

        // 用sayobot搜索谱面setId
        else if (searchData.sayoTitle) {
            beatmapSetId = await sayobot.searchList(searchData.sayoTitle);
            if (beatmapSetId.code) {
                throw beatmapSetId.message;
            }
        }

        // 用osusearch搜索谱面setId
        else {
            beatmapSetId = await osusearch.search(searchData);
            if (beatmapSetId.code) {
                throw beatmapSetId.message;
            }
        }

        // 用sayobot获取谱面信息
        let beatmapInfo = await sayobot.search(beatmapSetId);
        if (beatmapInfo.code) {
            throw beatmapInfo.message;
        }
        return beatmapInfo;
    }

}


module.exports = Arg;
