"use strict";

const UserInfo = require("../user/UserInfo");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'bot_bind',
    info: '绑定osu账号',
    command: ['setid', 'bind', 'set'],
    argsInfo: '[user] (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [2, -1],
    group: 'common',
    addUserToArg: false,
    helpInfo: {
        defaultHelp: true,
        customHelp: "",
        defaultDetail: true,
        customDetail: ""
    },
    /**
     * @param {import("../command/Arg")} arg
     * @param {{admin, host, nedb, commandsInfo, exscore}} globalConstant
     * @param {Number} qqId 发送者Id
     */
    call: async (arg, globalConstant, qqId) => {
        let apiObjects = arg.getOsuApiObject();
        return await new UserInfo(globalConstant.host).bindUser(globalConstant.nedb, qqId, apiObjects[0]);
    }
};
