"use strict";

const getUserData = require("../api/getUserData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_user',
    info: '玩家查询',
    command: ['stat', 'statme', 'u', 'user', 'p', 'player'],
    argsInfo: '(user) (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [1, 0],
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
        return await new getUserData(globalConstant.host, globalConstant.apiKey, apiObjects).output(globalConstant.nedb);
    }
};
