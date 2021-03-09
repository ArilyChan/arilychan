"use strict";

const UserObject = require("./objects/UserObject");
const UserInfo = require("./UserInfo"); // 这里UserInfo不知道为什么要复制另外一份才正常
const RippleApi = require("./RippleApiRequest");
const SimpleUserObject = require("./objects/SimpleUserObject");
const utils = require("./utils");

class getUserData {
    constructor(host, apiObjects, isRX) {
        this.host = host;
        this.apiObject = (Array.isArray(apiObjects)) ? apiObjects[0] : apiObjects; // 只允许同时查一个人
        this.isRX = isRX;
    }

    async getUserObject(nedb) {
        const rippleUser = (this.isRX) ? await RippleApi.getUsersFullRx(this.apiObject, this.host) : await RippleApi.getUsersFull(this.apiObject, this.host);
        if (rippleUser.code === 404) throw "找不到玩家 " + utils.apiObjectToString(this.apiObject);
        if (rippleUser.code === 400) throw "必须指定玩家名或Id（或先setid绑定私服账户）";
        if (rippleUser.code === "error") throw "获取玩家出错 " + utils.apiObjectToString(this.apiObject);
        let userObject = new UserObject(rippleUser);
        // 存储userObject
        await new UserInfo(this.host).saveUserObject(nedb, userObject, this.isRX);
        return userObject;
    }

    async getSimpleUserObject() {
        const rippleUser = await RippleApi.getUsers(this.apiObject, this.host);
        if (rippleUser.code === 404) throw "找不到玩家 " + utils.apiObjectToString(this.apiObject);
        if (rippleUser.code === 400) throw "必须指定玩家名或Id（或先setid绑定私服账户）";
        if (rippleUser.code === "error") throw "获取玩家出错 " + utils.apiObjectToString(this.apiObject);
        let userObject = new SimpleUserObject(rippleUser);
        return userObject;
    }

    async output(nedb) {
        try {
            let rippleUser = await this.getUserObject(nedb);
            if (typeof rippleUser === "string") return rippleUser; // 报错消息
            let mode = (this.apiObject.m) ? this.apiObject.m : undefined;
            // 从数据库里寻找beforeUserInfo
            let beforeUserInfo = await new UserInfo(this.host).getBeforeUserObject(nedb, rippleUser.userId, this.isRX);
            return rippleUser.tocompareString(beforeUserInfo, mode, this.isRX);
        }
        catch (ex) {
            return ex;
        }
    }
}

module.exports = getUserData;