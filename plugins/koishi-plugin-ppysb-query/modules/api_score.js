"use strict";

const getScoreData = require("../api/getScoreData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_score',
    info: '指定玩家谱面成绩查询',
    command: ['s', 'score'],
    argsInfo: '[beatmap] | [user] (:mode)',
    args: ['beatmapStringWithUser', 'userStringWithBeatmap', 'modeString'],
    argNecessity: [2, 2, 0],
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
        try {
            let arg2 = await arg.getBeatmapId();
            let apiObjects = arg2.getOsuApiObject();
            return await new getScoreData(globalConstant.exscore, globalConstant.host, apiObjects, false, false, false, false).output();
        }
        catch (ex) {
            return ex;
        }
    }
};
