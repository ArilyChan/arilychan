"use strict";

const getBeatmapData = require("../api/getBeatmapData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_beatmap',
    info: '谱面查询',
    command: ['b', 'beatmap', 'search', 'map'],
    argsInfo: '[beatmap] (:mode)',
    args: ['beatmapStringWithoutUser', 'modeString'],
    argNecessity: [2, -1],
    group: 'common',
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
            return await new getBeatmapData(globalConstant.host, apiObjects).output();
        }
        catch (ex) {
            return ex;
        }
    }
};
