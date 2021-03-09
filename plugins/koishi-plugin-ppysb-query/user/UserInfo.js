"use strict";

const UserObject = require("../api/objects/UserObject");
const getUserData = require("../api/getUserData");
const utils = require('../api/utils');

// 记录内容：
// userId, userName, beforeUserObject, afterUserObject, beforeRxUserObject, afterRxUserObject, (qqId), (defaultMode), _Id(db自带)

class UserInfo {
    constructor(host) {
        this.host = host;
    }

    async updateToday(nedb, userId, newUserObjectJson, isRx) {
        // afterUserObject与newUserObject同一天，更新afterUserObject
        if (isRx) await nedb.update({ userId: userId }, { $set: { afterRxUserObject: newUserObjectJson } });
        else await nedb.update({ userId: userId }, { $set: { afterUserObject: newUserObjectJson } });
    }

    async setNewDay(nedb, userId, oldUserObjectJson, newUserObjectJson, isRx) {
        // afterUserObject与newUserObject不为同一天，冒泡
        if (isRx) await nedb.update({ userId: userId }, { $set: { beforeRxUserObject: oldUserObjectJson, afterRxUserObject: newUserObjectJson } });
        else await nedb.update({ userId: userId }, { $set: { beforeUserObject: oldUserObjectJson, afterUserObject: newUserObjectJson } });
    }

    async saveUserObject(nedb, newUserObject, isRx) {
        let userId = newUserObject.userId;
        // 查找是否已有记录
        let res = await nedb.findOne({ userId: userId });
        if (!res) {
            // 初始化记录
            if (isRx) await nedb.insert({ userId: userId, userName: newUserObject.username, beforeRxUserObject: newUserObject.toJson(), afterRxUserObject: newUserObject.toJson() });
            else await nedb.insert({ userId: userId, userName: newUserObject.username, beforeUserObject: newUserObject.toJson(), afterUserObject: newUserObject.toJson() });
        }
        else if (isRx && (!res.afterRxUserObject || !res.beforeRxUserObject)) {
            // 缺少rx stat记录
            await nedb.update({ userId: userId }, { $set: { beforeRxUserObject: newUserObject.toJson(), afterRxUserObject: newUserObject.toJson() } });
        }
        else if (!isRx && (!res.afterUserObject || !res.beforeUserObject)) {
            // 缺少stat记录
            await nedb.update({ userId: userId }, { $set: { beforeUserObject: newUserObject.toJson(), afterUserObject: newUserObject.toJson() } });
        }
        else {
            // 更新userObject
            if (isRx) {
                let afterRxUserObject = new UserObject().init(res.afterRxUserObject);
                if (afterRxUserObject.getDateString() === newUserObject.getDateString()) await this.updateToday(nedb, userId, newUserObject.toJson(), true);
                else await this.setNewDay(nedb, userId, res.afterRxUserObject, newUserObject.toJson(), true);
            }
            else {
                let afterUserObject = new UserObject().init(res.afterUserObject);
                if (afterUserObject.getDateString() === newUserObject.getDateString()) await this.updateToday(nedb, userId, newUserObject.toJson(), false);
                else await this.setNewDay(nedb, userId, res.afterUserObject, newUserObject.toJson(), false);
            }
        }
    }

    // 获取对比资料
    async getBeforeUserObject(nedb, userId, isRx) {
        let res = await nedb.findOne({ userId: userId });
        if (res) {
            if (isRx && res.beforeRxUserObject) return new UserObject().init(res.beforeRxUserObject);
            if (!isRx && res.beforeUserObject) return new UserObject().init(res.beforeUserObject);
            return undefined;
        }
        else return undefined;
    }

    // 绑定qqId
    async bindUser(nedb, qqId, apiObject) {
        try {
            let output = "";
            // 检查是否绑定过
            let res = await nedb.findOne({ qqId: qqId });
            if (res) {
                // 绑定过，删除原来的qqId和defaultMode
                output = output + "警告：您将自动与 " + res.userName + " 解除绑定\n";
                await nedb.update({ qqId: qqId }, { $unset: { qqId: true, defaultMode: true } });
            }
            let userObject = await new getUserData(this.host, apiObject, false).getUserObject(nedb);

            // 这时数据库已记录该玩家，添加qqId字段即可
            // 检查该玩家是否已被绑定其他玩家
            let userId = userObject.userId;
            let res2 = await nedb.findOne({ userId: userId });
            if (res2) {
                if (res2.qqId) {
                    // 正在绑定其他QQ
                    // output = output + "警告：自动解除该玩家与QQ " + res2.qqId + " 的绑定\n";
                    // 防止恶意抢绑，禁止绑定
                    return "错误：该账号已与QQ " + res2.qqId + " 绑定，如绑定错误请联系管理员\n";
                }
                await nedb.update({ userId: userId }, { $set: { qqId: qqId } });
                output = output + "绑定账号" + userObject.username + "成功";
                if (apiObject.m || apiObject.m === 0) {
                    output = output + "，默认模式设置为" + utils.getModeString(apiObject.m);
                    await nedb.update({ userId: userId }, { $set: { defaultMode: apiObject.m } });
                }
                else await nedb.update({ userId: userId }, { $set: { defaultMode: 0 } });
                return output;
            }
            return output + "数据库出错惹！";
        }
        catch (ex) {
            return ex;
        }
    }

    // 解绑QQ
    async unbindUser(nedb, qqId) {
        let res = await nedb.findOne({ qqId: qqId });
        if (res) {
            // 绑定过，删除原来的qqId和defaultMode
            await nedb.update({ qqId: qqId }, { $unset: { qqId: true, defaultMode: true } });
            return qqId + " 成功解除与 " + res.userName + " 的绑定";
        }
        else return qqId + " 还没有绑定任何账号";
    }

    // 设置默认模式
    async setMode(nedb, qqId, mode) {
        let res = await nedb.findOne({ qqId: qqId });
        if (res) {
            // 绑定过，更改原来的defaultMode
            await nedb.update({ qqId: qqId }, { $set: { defaultMode: mode } });
            return "您的默认游戏模式已设置为 " + utils.getModeString(mode);
        }
        else return "您还没有绑定任何账号";
    }

    // 获取绑定账号Id和mod
    async getUserOsuInfo(qqId, nedb) {
        let res = await nedb.findOne({ qqId: qqId });
        if (res) {
            let defaultMode = res.defaultMode || 0;
            return { qqId: qqId, osuId: res.userId, osuName: res.userName, defaultMode: defaultMode };
        }
        else return { qqId: qqId, osuId: -1, osuName: "", defaultMode: -1 };
    }
}

module.exports = UserInfo;