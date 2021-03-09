"use strict";

const getScoreData = require("../api/getScoreData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_score_top',
    info: '谱面最高成绩查询',
    command: ['t', 'top'],
    argsInfo: '[beatmap] (:mode)',
    args: ['beatmapStringWithoutUser', 'modeString'],
    argNecessity: [2, 0],
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
            return await new getScoreData(globalConstant.exscore, globalConstant.host, apiObjects, false, true, false, false).output();
        }
        catch (ex) {
            return ex;
        }
    }
};
