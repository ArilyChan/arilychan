"use strict";

module.exports = {
    enabled: true,
    adminCommand: false,
    type: 'music',
    info: '试听谱面',
    command: ['music', 'preview', 'm', 'pm'],
    argsInfo: '[beatmap]',
    args: ['beatmapStringWithoutUser'],
    argNecessity: [2],
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
     */
    call: async (arg) => {
        try {
            // 为了偷懒，这里的beatmapId其实是beatmapSetId，使用时一定要注意
            const arg2 = await arg.getBeatmapSetId();
            const beatmapSetId = arg2.beatmapId;
            return `[CQ:record,file=https://b.ppy.sh/preview/${beatmapSetId}.mp3]`;
        }
        catch (ex) {
            return ex;
        }
    }
};
