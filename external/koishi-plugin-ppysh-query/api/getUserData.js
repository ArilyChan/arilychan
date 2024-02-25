"use strict";

const UserObject = require("./objects/UserObject");
const UserInfo = require("./UserInfo"); // 这里UserInfo不知道为什么要复制另外一份才正常
const OsuApi = require("./ApiRequest");
const utils = require("./utils");

class getUserData {
    constructor(host, apiKey, apiObjects) {
        this.host = host;
        this.apiKey = apiKey;
        this.apiObject = (Array.isArray(apiObjects)) ? apiObjects[0] : apiObjects; // 只允许同时查一个人
    }

    async getUserObject(nedb) {
        const user = await OsuApi.getUser(this.apiObject, this.host, this.apiKey);
        if (user.code === 404) throw "找不到玩家 " + utils.apiObjectToString(this.apiObject);
        if (user.code === "error") throw "获取玩家出错 " + utils.apiObjectToString(this.apiObject);
        if (user.length <= 0) throw "获取玩家出错 " + utils.apiObjectToString(this.apiObject);
        let userObject = new UserObject(user[0]);
        // 存储userObject
        let mode = (this.apiObject.m) ? parseInt(this.apiObject.m) : 0;
        await new UserInfo(this.host, this.apiKey).saveUserObject(nedb, userObject, mode);
        return userObject;
    }


    async output(nedb) {
        try {
            let user = await this.getUserObject(nedb);
            if (typeof user === "string") return user; // 报错消息
            let mode = (this.apiObject.m) ? parseInt(this.apiObject.m) : 0;
            // 从数据库里寻找beforeUserInfo
            let beforeUserInfo = await new UserInfo(this.host, this.apiKey).getBeforeUserObject(nedb, user.userId, mode);
            return user.tocompareString(beforeUserInfo, mode);
        }
        catch (ex) {
            return ex;
        }
    }
}

module.exports = getUserData;