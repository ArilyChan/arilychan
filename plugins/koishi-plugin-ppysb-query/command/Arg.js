"use strict";

const OsusearchApi = require("../api/OsusearchApiRequest");

/**
 * 指令参数对象
 * @property {Number} beatmapId 谱面Id，没直接提供为-1，需要通过osusearch获取
 * @property {Object} beatmapSearchInfo 谱面待搜索的信息
 * @property {String} beatmapSearchInfo.artist 
 * @property {String} beatmapSearchInfo.title 
 * @property {String} beatmapSearchInfo.mapper 
 * @property {String} beatmapSearchInfo.diff_name 
 * @property {String} beatmapSearchString
 * @property {Array<String>} users 玩家名Array，未指定玩家则length=0
 * @property {0|1|2|3} mode 模式
 * @property {Number} mods modsValue
 * @property {Number} limit 只用于部分功能
 * @property {Array<"string"|"id">} type 指定玩家名类型
 */
class Arg {
    /**
     * 构建Arg对象
     * @param {Object} args 从指令参数字符串拿到的各参数字符串
     * @param {String=} args.beatmapString beatmap字符串，谱面Id或是需要search的谱面字符串
     * @param {String=} args.userStringWithBeatmap 玩家名字符串，以/分割
     * @param {String=} args.userStringWithoutBeatmap 玩家名字符串，以/分割
     * @param {String=} args.modsString mod字符串
     * @param {String=} args.modeString 模式字符串
     * @param {String=} args.onlyModeString 模式字符串
     * @param {String=} args.limitString limit字符串
     */
    constructor(args) {
        this.beatmapId = -1;
        this.beatmapSearchInfo = {};
        if (args.beatmapStringWithUser) {
            this.beatmapSearchString = args.beatmapStringWithUser;
            this.getBeatmapInfo(args.beatmapStringWithUser);
        }
        if (args.beatmapStringWithoutUser) {
            this.beatmapSearchString = args.beatmapStringWithoutUser;
            this.getBeatmapInfo(args.beatmapStringWithoutUser);
        }
        if (args.userStringWithBeatmap) this.users = this.getUsers(args.userStringWithBeatmap);
        if (args.userStringWithoutBeatmap) this.users = this.getUsers(args.userStringWithoutBeatmap);
        if (args.modsString) this.mods = this.getEnabledModsValue(args.modsString);
        if (args.modeString || args.modeString === 0) this.mode = this.getMode(args.modeString);
        if (args.onlyModeString || args.onlyModeString === 0) this.mode = this.getMode(args.onlyModeString);
        if (args.limitString) this.limit = parseInt(args.limitString);
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
     * 获取搜索谱面args
     * @param {String} beatmapString 1234567 或 artist - title(mapper)[diff_name]
     */
    getBeatmapInfo(beatmapString) {
        if (this.checkInt(beatmapString)) this.beatmapId = parseInt(beatmapString);
        else {
            let s = beatmapString;
            // 先取mapper，因为mapper名字里可能有-[]
            let mapperStart = s.lastIndexOf("(");
            let mapperEnd = s.lastIndexOf(")");
            if (mapperStart >= 0 && mapperEnd >= 0 && mapperEnd - mapperStart > 1) {
                this.beatmapSearchInfo.mapper = s.substring(mapperStart + 1, mapperEnd).trim();
                s = s.substring(0, mapperStart) + s.substring(mapperEnd + 1);
            }
            // 取artist
            let artistEnd = s.indexOf("-");
            if (artistEnd >= 0) {
                this.beatmapSearchInfo.artist = s.substring(0, artistEnd).trim();
                s = s.substring(artistEnd + 1)
            }
            // 取diff_name
            let diffStart = s.lastIndexOf("[");
            let diffEnd = s.lastIndexOf("]");
            if (diffStart >= 0 && diffEnd >= 0 && diffEnd - diffStart > 1) {
                this.beatmapSearchInfo.diff_name = s.substring(diffStart + 1, diffEnd).trim();
                s = s.substring(0, diffStart) + s.substring(diffEnd + 1);
            }
            // 取title
            this.beatmapSearchInfo.title = s.trim();
        }
    }

    /**
     * 只用于查询单个谱面的多人成绩
     * @param {String|Number} userString 以/分割的玩家名
     * @returns {Array<String>} 玩家名Array，未指定玩家则length=0
     */
    getUsers(userString) {
        let users = [];
        if (typeof userString === "number") {
            // 是从数据库获取的
            if (userString > 0) users.push(userString.toString());
            // 数据库找不到就是空
            return users;
        }
        if (typeof userString !== "string") return users;
        users = userString.split("/").filter(d => d).map(d => d.trim());
        // 防止请求过多，人数控制在10人以内
        if (users.length > 10) users = users.slice(0, 10);
        return users;
    }

    /**
     * 模式字符串转mod
     * @param {String} modeString 模式字符串
     * @returns {0|1|2|3}
     */
    getMode(modeString) {
        let s = modeString.toString().trim().toLowerCase();
        if (s === "0" || s === "1" || s === "2" || s === "3") return parseInt(s);
        else if (s.indexOf("std") >= 0) return 0;
        else if (s.indexOf("standard") >= 0) return 0;
        else if (s.indexOf("click") >= 0) return 0;
        else if (s.indexOf("泡泡") >= 0) return 0;
        else if (s.indexOf("taiko") >= 0) return 1;
        else if (s.indexOf("鼓") >= 0) return 1;
        else if (s.indexOf("catch") >= 0) return 2;
        else if (s.indexOf("ctb") >= 0) return 2;
        else if (s.indexOf("接") >= 0) return 2;
        else if (s.indexOf("mania") >= 0) return 3;
        else if (s.indexOf("key") >= 0) return 3;
        else if (s.indexOf("骂娘") >= 0) return 3;
        else if (s.indexOf("琴") >= 0) return 3;
        else if (s === "s") return 0;
        else if (s === "t") return 1;
        else if (s === "c") return 2;
        else if (s === "m") return 3;
        else return 0;
    }

    /**
     * 计算mods数值（指令+号后面的）
     * @param {String} modsString mods字符串，都是两个字母缩写
     * @returns {Number} mods value
     */
    getEnabledModsValue(modsString) {
        let mods = {
            NM: 0, // None
            NF: 1,
            EZ: 2,
            TD: 4, //TouchDevice
            HD: 8,
            HR: 16,
            SD: 32,
            DT: 64,
            RX: 128, // Relax
            HT: 256,
            NC: 512, // Only set along with DoubleTime. i.e: NC only gives 576
            FL: 1024,
            //Autoplay : 2048,
            SO: 4096,
            AP: 8192,    // Autopilot
            PF: 16384, // Only set along with SuddenDeath. i.e: PF only gives 16416  
            '4K': 32768,
            '5K': 65536,
            '6K': 131072,
            '7K': 262144,
            '8K': 524288,
            FI: 1048576,
            RD: 2097152, //Random
            //Cinema : 4194304,
            //Target : 8388608,
            '9K': 16777216,
            //KeyCoop : 33554432,
            '1K': 67108864,
            '3K': 134217728,
            '2K': 268435456,
            V2: 536870912, //ScoreV2
            MR: 1073741824 // Mirror
            //KeyMod : Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
            //FreeModAllowed : NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Relax2 | SpunOut | KeyMod,
            //ScoreIncreaseMods : Hidden | HardRock | DoubleTime | Flashlight | FadeIn
        };
        let sum = 0;
        let i = 0;
        let length = modsString.length;
        while (i + 2 <= length) {
            let s = modsString.substring(i, i + 2);
            if (mods[s] !== undefined) {
                if (s === 'NC') sum = sum + mods.DT;
                else if (s === 'PF') sum = sum + mods.SD;
                sum = sum + mods[s];
            }
            i += 2;
        }
        return sum;
    }

    /**
     * 转为osu api格式
     * @returns {Array<Object>} [options, ...]
     */
    getOsuApiObject() {
        let users = this.users;
        let options = [];
        if (users && users.length > 0) options = users.map(singleuser => {
            let option = {};
            if ((singleuser.length > 4) && (singleuser.substring(0, 1) === "\"") && (singleuser.substring(singleuser.length - 1) === "\"")) {
                // 带引号强制字符串形式
                option.u = singleuser.substring(1, singleuser.length - 1);
                option.type = 'string';
            }
            else {
                option.u = singleuser;
            }
            if (this.beatmapId > 0) option.b = this.beatmapId;
            if (this.mode || this.mode === 0) option.m = this.mode;
            if (this.mods || this.mods === 0) option.mods = this.mods;
            if (this.limit) option.limit = this.limit;
            return option;
        });
        else {
            let option = {};
            if (this.beatmapId > 0) option.b = this.beatmapId;
            if (this.mode || this.mode === 0) option.m = this.mode;
            if (this.mods || this.mods === 0) option.mods = this.mods;
            if (this.limit) option.limit = this.limit;
            options.push(option);
        }
        return options;
    }

    /**
     * 通过osusearch获取谱面id
     * @returns {Arg} this
     */
    async getBeatmapId() {
        if (this.beatmapId > 0) return this;
        if (Object.keys(this.beatmapSearchInfo).length <= 0) return this;
        let id = await OsusearchApi.search(this.beatmapSearchInfo);
        if (typeof id === "number") {
            this.beatmapId = id;
        }
        else {
            if (id.code === 404) throw "找不到谱面：" + JSON.stringify(this.beatmapSearchInfo);
            else throw "从osusearch获取谱面id失败";
        }
        return this;
    }

    // 为了偷懒，这里的beatmapId其实是beatmapSetId，使用时一定要注意
    async getBeatmapSetId() {
        if (this.beatmapId > 0) return this;
        if (Object.keys(this.beatmapSearchInfo).length <= 0) return this;
        let id = await OsusearchApi.search(this.beatmapSearchInfo, "set");
        if (typeof id === "number") {
            this.beatmapId = id;
        }
        else {
            if (id.code === 404) throw "找不到谱面：" + JSON.stringify(this.beatmapSearchInfo);
            else throw "从osusearch获取谱面id失败";
        }
        return this;
    }
}


module.exports = Arg;