"use strict";

const getScoreData = require("../api/getScoreData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_score_me',
    info: '自己谱面成绩查询',
    command: ['me'],
    argsInfo: '[beatmap] (:mode)',
    args: ['beatmapStringWithoutUser', 'modeString'],
    argNecessity: [2, 0],
    group: 'classic',
    addUserToArg: true,
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
