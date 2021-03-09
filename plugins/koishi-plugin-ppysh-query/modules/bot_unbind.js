"use strict";

const UserInfo = require("../user/UserInfo");

module.exports = {
    enabled: true,
    adminCommand: true,
    type: 'bot_unbind',
    info: '解绑osu账号',
    command: ['unsetid', 'unbind', 'unset'],
    argsInfo: '[qqId]',
    args: ['userStringWithoutBeatmap'],
    argNecessity: [2],
    addUserToArg: false,
    helpInfo: {
        defaultHelp: true,
        customHelp: "",
        defaultDetail: true,
        customDetail: ""
    },
    /**
     * @param {import("../command/Arg")} arg
     * @param {{admin, apiKey, host, nedb, commandsInfo}} globalConstant
     */
    call: async (arg, globalConstant) => {
        let qqId = parseInt(arg.getOsuApiObject()[0].u);
        if (!qqId) return "请输入需要解绑的QQ号";
        return await new UserInfo(globalConstant.host, globalConstant.apiKey).unbindUser(globalConstant.nedb, qqId);
    }
};
