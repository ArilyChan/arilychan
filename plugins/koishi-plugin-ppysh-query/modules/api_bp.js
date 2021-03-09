"use strict";

const getBestScoresData = require("../api/getBestScoresData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_bp',
    info: 'bp成绩查询（省略#number则输出bp5）',
    command: ['bp', 'best', 'bbp', 'bests', 'mybp', 'bpme'],
    argsInfo: '(user) (#number) (:mode)',
    args: ['userStringWithoutBeatmap', 'limitString', 'modeString'],
    argNecessity: [1, -1, 0],
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
        return await new getBestScoresData(globalConstant.host, globalConstant.apiKey, apiObjects).output();
    }
};
