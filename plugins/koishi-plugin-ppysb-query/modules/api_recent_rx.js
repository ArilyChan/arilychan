"use strict";

const getRecentScoresData = require("../api/getRecentScoresData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_recent_rx',
    info: '获取最近成绩（包括未pass成绩）（relax模式）',
    command: ['rrx', 'rctrx', 'rctpprx', 'recentrx'],
    argsInfo: '(user) (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [1, 0],
    group: 'relax',
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
     */
    call: async (arg, globalConstant) => {
        let apiObjects = arg.getOsuApiObject();
        return await new getRecentScoresData(globalConstant.exscore, globalConstant.host, apiObjects, true, false).output();
    }
};
