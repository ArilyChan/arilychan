"use strict";

const getBeatmapData = require("../api/getBeatmapData");

module.exports = {
    enabled: false, // 是否启用
    adminCommand: false, // 管理员专用
    type: 'api_beatmap', // 指令类型
    info: '谱面查询', // 简要说明，显示在总help中
    command: ['b', 'beatmap', 'search', 'map'], // 指令字符串
    argsInfo: '[beatmap] (:mode)', // 参数说明，显示在本指令help中
    args: ['beatmapStringWithoutUser', 'modeString'], // 参数类型，用于正则获取参数，请参阅command/CommandsInfo.js
    argNecessity: [2, -1], // 参数要求 2：必须直接提供； 1：必须提供，省略时从数据库中寻找，如果找不到则报错，如userId； 0：可省略，省略时从数据库中寻找，如果找不到则省略，如mode； -1：可省略；
    group: 'common', // 决定总help内容 common：通用指令，help、helprx均显示； classic：正常模式，help显示； relax：relax模式，helprx显示； admin：仅管理员使用，不显示在总help中
    addUserToArg: false, // 将数据库中的userId加入参数中，需要指令强制省略userId，只有像setmode这种只对本人生效的才会需要
    helpInfo: {
        defaultHelp: true, // 总help中使用默认说明（显示command[0]和info）
        customHelp: "",  // defaultHelp设为false生效，自定义总help，单行
        defaultDetail: true, // 本指令help中使用默认说明（显示所有command和argsInfo）
        customDetail: "" // defaultDetail设为false生效，本指令help，可以多行
    },
    /**
     * @param {import("../command/Arg")} arg
     * @param {{admin, host, nedb, commandsInfo, exscore}} globalConstant
     */
    call: async (arg, globalConstant) => {
        // 指令运行，请参阅api文件夹或其他模块，返回字符串
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
