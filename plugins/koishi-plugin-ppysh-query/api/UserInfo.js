"use strict";

const UserObject = require("../api/objects/UserObject");
const getUserData = require("../api/getUserData");
const utils = require('../api/utils');

// 记录内容：
// userId, userName, mode, beforeUserObject, afterUserObject, (qqId), (defaultMode), _Id(db自带)

class UserInfo {
    constructor(host, apiKey) {
        this.host = host;
        this.apiKey = apiKey;
    }

    async updateToday(nedb, userId, newUserObjectJson, mode) {
        // afterUserObject与newUserObject同一天，更新afterUserObject
        await nedb.update({ $and: [{ userId }, { mode }] }, { $set: { afterUserObject: newUserObjectJson } });
    }

    async setNewDay(nedb, userId, oldUserObjectJson, newUserObjectJson, mode) {
        // afterUserObject与newUserObject不为同一天，冒泡
        await nedb.update({ $and: [{ userId }, { mode }] }, { $set: { beforeUserObject: oldUserObjectJson, afterUserObject: newUserObjectJson } });
    }

    async saveUserObject(nedb, newUserObject, mode) {
        let userId = newUserObject.userId;
        // 查找是否已有记录
        let res = await nedb.findOne({ $and: [{ userId }, { mode }] });
        if (!res) {
            // 初始化记录
            await nedb.insert({ userId: userId, userName: newUserObject.username, mode: mode, beforeUserObject: newUserObject.toJson(), afterUserObject: newUserObject.toJson() });
        }
        else {
            // 更新userObject
            let afterUserObject = new UserObject().init(res.afterUserObject, mode);
            if (afterUserObject.getDateString() === newUserObject.getDateString()) await this.updateToday(nedb, userId, newUserObject.toJson(), mode);
            else await this.setNewDay(nedb, userId, res.afterUserObject, newUserObject.toJson(), mode);
        }
    }

    // 获取对比资料
    async getBeforeUserObject(nedb, userId, mode = 0) {
        let res = await nedb.findOne({ $and: [{ userId }, { mode }] });
        if (res) {
            if (res.beforeUserObject) return new UserObject().init(res.beforeUserObject, mode);
            return undefined;
        }
        else return undefined;
    }

    // 绑定qqId
    async bindUser(nedb, qqId, apiObject) {
        try {
            let output = "";
            // 检查是否绑定过
            let res = await nedb.find({ qqId: qqId });
            if (res.length > 0) {
                // 绑定过，删除原来的qqId和defaultMode
                output = output + "警告：您将自动与 " + res[0].userName + " 解除绑定\n";
                await nedb.update({ $and: [{ qqId }, { mode:0 }] }, { $unset: { qqId: true, defaultMode: true } });
                await nedb.update({ $and: [{ qqId }, { mode:1 }] }, { $unset: { qqId: true, defaultMode: true } });
                await nedb.update({ $and: [{ qqId }, { mode:2 }] }, { $unset: { qqId: true, defaultMode: true } });
                await nedb.update({ $and: [{ qqId }, { mode:3 }] }, { $unset: { qqId: true, defaultMode: true } });
            }
            let userObject = await new getUserData(this.host, this.apiKey, apiObject).getUserObject(nedb);

            // 这时数据库已记录该玩家，添加qqId字段即可
            // 检查该玩家是否已被绑定其他玩家
            let userId = userObject.userId;
            let res2 = await nedb.find({ userId: userId });
            if (res2.length > 0) {
                if (res2[0].qqId) {
                    // 正在绑定其他QQ
                    // output = output + "警告：自动解除该玩家与QQ " + res2.qqId + " 的绑定\n";
                    // 防止恶意抢绑，禁止绑定
                    return "错误：该账号已与QQ " + res2[0].qqId + " 绑定，如绑定错误请联系管理员\n";
                }
                await nedb.update({ $and: [{ userId }, { mode:0 }] }, { $set: { qqId: qqId } });
                await nedb.update({ $and: [{ userId }, { mode:1 }] }, { $set: { qqId: qqId } });
                await nedb.update({ $and: [{ userId }, { mode:2 }] }, { $set: { qqId: qqId } });
                await nedb.update({ $and: [{ userId }, { mode:3 }] }, { $set: { qqId: qqId } });
                output = output + "绑定账号" + userObject.username + "成功";
                if (apiObject.m || apiObject.m === 0) {
                    output = output + "，默认模式设置为" + utils.getModeString(apiObject.m);
                    let mode = parseInt(apiObject.m);
                    await nedb.update({ $and: [{ userId }, { mode:0 }] }, { $set: { defaultMode: mode } });
                    await nedb.update({ $and: [{ userId }, { mode:1 }] }, { $set: { defaultMode: mode } });
                    await nedb.update({ $and: [{ userId }, { mode:2 }] }, { $set: { defaultMode: mode } });
                    await nedb.update({ $and: [{ userId }, { mode:3 }] }, { $set: { defaultMode: mode } });
                }
                await nedb.update({ $and: [{ userId }, { mode:0 }] }, { $set: { defaultMode: 0 } });
                await nedb.update({ $and: [{ userId }, { mode:1 }] }, { $set: { defaultMode: 0 } });
                await nedb.update({ $and: [{ userId }, { mode:2 }] }, { $set: { defaultMode: 0 } });
                await nedb.update({ $and: [{ userId }, { mode:3 }] }, { $set: { defaultMode: 0 } });
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
        let res = await nedb.find({ qqId: qqId });
        if (res.length>0) {
            // 绑定过，删除原来的qqId和defaultMode
            await nedb.update({ $and: [{ qqId }, { mode:0 }] }, { $unset: { qqId: true, defaultMode: true } });
            await nedb.update({ $and: [{ qqId }, { mode:1 }] }, { $unset: { qqId: true, defaultMode: true } });
            await nedb.update({ $and: [{ qqId }, { mode:2 }] }, { $unset: { qqId: true, defaultMode: true } });
            await nedb.update({ $and: [{ qqId }, { mode:3 }] }, { $unset: { qqId: true, defaultMode: true } });
            return qqId + " 成功解除与 " + res.userName + " 的绑定";
        }
        else return qqId + " 还没有绑定任何账号";
    }

    // 设置默认模式
    async setMode(nedb, qqId, mode) {
        mode = parseInt(mode);
        let res = await nedb.find({ qqId: qqId });
        if (res.length>0) {
            // 绑定过，更改原来的defaultMode
            await nedb.update({ $and: [{ qqId }, { mode:0 }] }, { $set: { defaultMode: mode } });
            await nedb.update({ $and: [{ qqId }, { mode:1 }] }, { $set: { defaultMode: mode } });
            await nedb.update({ $and: [{ qqId }, { mode:2 }] }, { $set: { defaultMode: mode } });
            await nedb.update({ $and: [{ qqId }, { mode:3 }] }, { $set: { defaultMode: mode } });
            return "您的默认游戏模式已设置为 " + utils.getModeString(mode);
        }
        else return "您还没有绑定任何账号";
    }

    // 获取绑定账号Id和mod
    async getUserOsuInfo(qqId, nedb) {
        let res = await nedb.find({ qqId: qqId });
        if (res.length>0) {
            let defaultMode = res[0].defaultMode || 0;
            return { qqId: qqId, osuId: res[0].userId, osuName: res[0].userName, defaultMode: defaultMode };
        }
        else return { qqId: qqId, osuId: -1, osuName: "", defaultMode: -1 };
    }
}

module.exports = UserInfo;