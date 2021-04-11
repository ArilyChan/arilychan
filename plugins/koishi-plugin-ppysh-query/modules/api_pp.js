"use strict";

const getBeatmapData = require("../api/getBeatmapData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_pp',
    info: '输出谱面pp，仅std',
    command: ['pp'],
    argsInfo: '[beatmap] (+mods)',
    args: ['beatmapStringWithoutUser', 'modsString'],
    argNecessity: [2, -1],
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
            let apiObjects = arg2.getOsuApiObject()[0];
            let mods = apiObjects.mods;
            delete apiObjects.mods;
            return await new getBeatmapData(globalConstant.host, globalConstant.apiKey, apiObjects).outputPP(mods);
        }
        catch (ex) {
            return ex;
        }
    }
};
