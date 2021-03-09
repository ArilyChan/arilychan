"use strict";

const getRecentScoresData = require("../api/getRecentScoresData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_recent',
    info: '获取最近成绩（包括未pass成绩）',
    command: ['r', 'rct', 'rctpp', 'recent'],
    argsInfo: '(user) (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [1, 0],
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
        let apiObjects = arg.getOsuApiObject();
        return await new getRecentScoresData(globalConstant.host, globalConstant.apiKey, apiObjects, false).output();
    }
};
