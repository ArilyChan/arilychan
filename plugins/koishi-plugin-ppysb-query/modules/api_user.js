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
        return await new getUserData(globalConstant.host, apiObjects, false).output(globalConstant.nedb);
    }
};
