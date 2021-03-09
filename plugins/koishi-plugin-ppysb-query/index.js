"use strict";

const CommandsInfo = require("./command/CommandsInfo");
const Command = require("./command/Command");

class ppysbQuery {
    /**
     * @param {Object} params 
     * @param {Array<Number>} params.admin 管理员列表，必要
     * @param {String} [params.host] osu网址，默认为"osu.ppy.sb"
     * @param {String} [params.database] 数据库路径，默认为根目录下的Opsbot-Ripple-v1.db
     * @param {Array<String>} [params.prefixs] 指令前缀，必须为单个字符，默认为[*]
     * @param {String} [params.prefix] 兼容旧版，指令前缀，必须为单个字符，默认为*
     * @param {String} [params.prefix2] 兼容旧版，备用指令前缀，必须为单个字符，默认为*
     * @param {Boolean} [params.exscore] 设为true时获取谱面文件以计算更多数据，但是会拖慢响应时间，默认为false
     */
    constructor(params) {
        this.globalConstant = {};
        this.globalConstant.admin = params.admin || [];
        this.globalConstant.host = params.host || "osu.ppy.sb";
        this.database = params.database || './Opsbot-Ripple-v1.db';
        this.globalConstant.nedb = require('./database/nedb')(this.database);
        if (params.prefix || params.prefix2) {
            this.prefix = params.prefix || "*";
            this.prefix2 = params.prefix2 || "*";
            this.prefixs = [this.prefix, this.prefix2];
        }
        else {
            this.prefixs = params.prefixs || ["*"];
        }
        this.globalConstant.commandsInfo = new CommandsInfo(this.prefixs);
        this.globalConstant.exscore = params.exscore || false;
    }


    /**
     * 获得返回消息
     * @param {Number} qqId
     * @param {String} message 输入的消息
     */
    async apply(qqId, message) {
        try {
            if (!message.length || message.length < 2) return "";
            if (this.prefixs.indexOf(message.substring(0, 1)) < 0) return "";
            let commandObject = new Command(qqId, message.substring(1).trim(), this.globalConstant);
            let reply = await commandObject.execute();
            return reply;
        } catch (ex) {
            console.log(ex);
            return "";
        }
    }

}


module.exports.ppysbQuery = ppysbQuery;
// koishi插件
module.exports.name = 'koishi-plugin-ppysb-query'
module.exports.apply = (ctx, options) => {
    const pbq = new ppysbQuery(options);
    ctx.middleware(async (meta, next) => {
        try {
            const message = meta.message;
            const userId = meta.userId;
            let reply = await pbq.apply(userId, message);
            if (reply) {
                // record格式不要艾特
                if (reply.indexOf('CQ:record') > 0) {
                    await meta.$send(reply);
                } else {
                    await meta.$send(`[CQ:at,qq=${userId}]` + '\n' + reply);
                }
            } else return next();
        } catch (ex) {
            console.log(ex);
            return next();
        }
    })
}
