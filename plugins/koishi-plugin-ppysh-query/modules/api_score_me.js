"use strict";

const getScoreData = require("../api/getScoreData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_score_me',
    info: '自己谱面成绩查询',
    command: ['me'],
    argsInfo: '[beatmap] (+mods) (:mode)',
    args: ['beatmapStringWithoutUser', 'modsString', 'modeString'],
    argNecessity: [2, -1, 0],
    addUserToArg: true,
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
