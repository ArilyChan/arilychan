"use strict";

const getBestScoresData = require("../api/getBestScoresData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_ranknumber',
    info: '查询成绩统计数量',
    command: ['rn'],
    argsInfo: '(user) (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [1, 0],
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
        return await new getBestScoresData(globalConstant.exscore, globalConstant.host, apiObjects, false).outputRankNumber();
    }
};
