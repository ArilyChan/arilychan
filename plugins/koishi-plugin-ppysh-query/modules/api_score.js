"use strict";

const getScoreData = require("../api/getScoreData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_score',
    info: '指定玩家谱面成绩查询',
    command: ['s', 'score'],
    argsInfo: '[beatmap] | [user] (+mods) (:mode)',
    args: ['beatmapStringWithUser', 'userStringWithBeatmap', 'modsString', 'modeString'],
    argNecessity: [2, 2, -1, 0],
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
        try {
            let arg2 = await arg.getBeatmapId();
            let apiObjects = arg2.getOsuApiObject();
            return await new getScoreData(globalConstant.host, globalConstant.apiKey, apiObjects, false).output();
        }
        catch (ex) {
            return ex;
        }
    }
};
