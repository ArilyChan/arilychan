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
    group: 'classic',
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
        return await new getBestScoresData(globalConstant.exscore, globalConstant.host, apiObjects, false).output();
    }
};
