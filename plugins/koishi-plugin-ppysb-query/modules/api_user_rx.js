"use strict";

const getUserData = require("../api/getUserData");

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'api_user_rx',
    info: '玩家查询（relax模式）',
    command: ['statrx', 'rxstat', 'statmerx', 'statrxme', 'rxstatme', 'urx', 'userrx', 'prx', 'playerrx'],
    argsInfo: '(user) (:mode)',
    args: ['userStringWithoutBeatmap', 'modeString'],
    argNecessity: [1, 0],
    group: 'relax',
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
        return await new getUserData(globalConstant.host, apiObjects, true).output(globalConstant.nedb);
    }
};
