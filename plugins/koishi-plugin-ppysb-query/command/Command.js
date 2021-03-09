"use strict";

const Arg = require("./Arg");
const UserInfo = require("../user/UserInfo");

class Command {
    /**
     * @param {Number} qqId 发送者Id
     * @param {String} message 消息
     * @param {Object} globalConstant 
     * @param {Array<Number>} globalConstant.admin 管理员列表
     * @param {String} globalConstant.host osu网址
     * @param {import("../database/nedb")} globalConstant.nedb 数据库
     * @param {import("./CommandsInfo")} globalConstant.commandsInfo 指令
     */
    constructor(qqId, message, globalConstant) {
        this.qqId = qqId;
        /** @type {String} */
        this.msg = (message) ? message.trim().replace(/&#(x)?(\w+);/g, function ($, $1, $2) {
            return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
        }) : "";
        this.commandString = "";
        this.argString = "";
        this.userInfo = { qqId: qqId, osuId: -1, osuName: "", defaultMode: "" };
        this.globalConstant = globalConstant;
    }

    /**
     * 拆出指令和参数
     * @returns {Boolean} 消息是否符合指令形式
     */
    cutCommand() {
        const commandReg = this.globalConstant.commandsInfo.commandReg;
        const mr = commandReg.exec(this.msg);
        if (mr === null) return false;
        else {
            this.commandString = mr[1].toLowerCase();
            this.argString = this.msg.substring(this.commandString.length).trim();
            return true;
        }
    }

    async getUserInfo() {
        this.userInfo = await new UserInfo(this.globalConstant.host).getUserOsuInfo(this.qqId, this.globalConstant.nedb);
    }

    getNoArgErrorMessage(argName, argNecessity) {
        let errorMessage = "参数错误：";
        argName = argName.toLowerCase();
        if (argName.indexOf("userstringwithbeatmap") >= 0 || argName.indexOf("userstringwithoutbeatmap") >= 0) errorMessage = errorMessage + "缺少必要参数：玩家名";
        else if (argName.indexOf("beatmapstringwithuser") >= 0 || argName.indexOf("beatmapstringwithoutuser") >= 0) errorMessage = errorMessage + "缺少必要参数：谱面";
        else if (argName.indexOf("mode") >= 0) errorMessage = errorMessage + "缺少必要参数：模式";
        else if (argName.indexOf("limit") >= 0) errorMessage = errorMessage + "缺少必要参数：索引";
        // else if (argName.indexOf("mods") >= 0) errorMessage = errorMessage + "缺少必要参数：mod";
        if (argNecessity === 1) errorMessage = errorMessage + "，绑定您的ppysb账号后可以省略";
        return errorMessage;
    }

    /**
     * 分析argString
     * @param {Object} commandInfo 
     * @param {Object} regs 
     * @returns {Promise<Arg>}
     */
    async getArgObject(regs, commandInfo) {
        let args = {};
        /**@type {Array<String>} */
        let nedb = this.globalConstant.nedb;
        let argsName = commandInfo.args;
        /**@type {Array<-1|0|1>}  2：必须直接提供 1：user，必须提供，省略时从存储中寻找 0：mods，可省略，省略时从存储中寻找，如果找不到则省略 -1：可省略 */
        let argNecessity = commandInfo.argNecessity;
        // 先去获取数据库
        await this.getUserInfo(nedb);
        // 比如me、setmode指令等没有userId参数，默认是查询已绑定账号
        if (commandInfo.addUserToArg) args.userStringWithoutBeatmap = this.userInfo.osuId;
        argsName.map((argName, index) => {
            let ar = regs[argName].exec(this.argString);
            if (ar === null) {
                // 没匹配到该参数
                if (argNecessity[index] === 2) throw this.getNoArgErrorMessage(argsName[index], 2);
                else if (argNecessity[index] === 1) {
                    if (argsName[index] === "userStringWithoutBeatmap" && this.userInfo.osuId > 0) args.userStringWithoutBeatmap = this.userInfo.osuId;
                    else if (argsName[index] === "userStringWithBeatmap" && this.userInfo.osuId > 0) args.userStringWithBeatmap = this.userInfo.osuId;
                    else if (argsName[index] === "modeString" && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0)) args.modeString = this.userInfo.defaultMode;
                    else if (argsName[index] === "onlyModeString" && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0)) args.onlyModeString = this.userInfo.defaultMode;
                    else throw this.getNoArgErrorMessage(argsName[index], 1);
                }
                else if (argNecessity[index] === 0) {
                    if (argsName[index] === "userStringWithoutBeatmap" && this.userInfo.osuId > 0) args.userStringWithoutBeatmap = this.userInfo.osuId;
                    else if (argsName[index] === "userStringWithBeatmap" && this.userInfo.osuId > 0) args.userStringWithBeatmap = this.userInfo.osuId;
                    else if (argsName[index] === "modeString" && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0)) args.modeString = this.userInfo.defaultMode;
                    else if (argsName[index] === "onlyModeString" && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0)) args.onlyModeString = this.userInfo.defaultMode;
                }
            }
            else {
                args[argName] = ar[1];
            }
        });
        return new Arg(args);
    }


    getHelp() {
        const prefix = this.globalConstant.commandsInfo.prefixs[0];
        const commands = this.globalConstant.commandsInfo.commands;
        let output = ""
        if (!this.argString) {
            // 输出全部classic指令
            output = output + "osu.ppy.sb classic指令查询\n";
            for (let com of commands) {
                if (com.group === "admin") continue; // 不显示管理员指令
                if (com.group === "relax") continue; // 不显示relax指令
                if (!com.helpInfo.defaultHelp) output = output + prefix + com.helpInfo.customHelp + "\n";
                else output = output + prefix + com.command[0] + " " + com.info + "\n";
            }
            output = output + "\n";
            output = output + prefix + "help + 指令 可以查询该指令详细信息\n";
            output = output + prefix + "helprx 可以查询relax指令\n";
            // output = output + "基本指令有：" + commands.reduce((acc, cur) => { return acc + cur.command[0] + "/" }, "");
            return output;
        }
        // 查找指令
        for (let com of commands) {
            if (com.command.includes(this.argString)) {
                if (!com.helpInfo.defaultDetail) return com.helpInfo.customDetail;
                else {
                    output = output + com.info + "\n";
                    output = output + "指令：" + com.command.join("/") + "\n";
                    output = output + "参数：" + com.argsInfo;
                    return output;
                }
            }
        }
        return "没有 " + this.argString + " 这个指令呢";
    }

    getHelpRelax() {
        const prefix = this.globalConstant.commandsInfo.prefixs[0];
        const commands = this.globalConstant.commandsInfo.commands;
        let output = ""
        // 输出全部relax指令
        output = output + "osu.ppy.sb relax指令查询\n";
        for (let com of commands) {
            if (com.group === "admin") continue; // 不显示管理员指令
            if (com.group === "classic") continue; // 不显示classic指令
            if (!com.helpInfo.defaultHelp) output = output + prefix + com.helpInfo.customHelp + "\n";
            else output = output + prefix + com.command[0] + " " + com.info + "\n";
        }
        output = output + "\n";
        output = output + prefix + "help + 指令 可以查询该指令详细信息\n";
        // output = output + "基本指令有：" + commands.reduce((acc, cur) => { return acc + cur.command[0] + "/" }, "");
        return output;
    }

    checkAdmin() {
        if (this.globalConstant.admin.indexOf(this.qqId) < 0) return false;
        else return true;
    }


    /**
     * 运行指令
     */
    async execute() {
        try {
            if (!this.cutCommand()) return ""; // 指令格式不正确
            // 帮助
            if (this.commandString === "help") {
                return this.getHelp();
            }
            if (this.commandString === "helprx") {
                return this.getHelpRelax();
            }
            // 查找指令
            const commands = this.globalConstant.commandsInfo.commands;
            for (let com of commands) {
                if (com.command.includes(this.commandString)) {
                    if (com.adminCommand && !this.checkAdmin()) return "该指令需要管理员权限";
                    let arg = await this.getArgObject(this.globalConstant.commandsInfo.regs, com);
                    return await com.call(arg, this.globalConstant, this.qqId);
                }
            }
            return ""; // 找不到该指令
        }
        catch (ex) {
            return ex;
        }
    }

}

module.exports = Command;