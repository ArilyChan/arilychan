'use strict'

const UserInfo = require('../user/UserInfo')

module.exports = {
  enabled: true,
  adminCommand: false,
  type: 'bot_setmode',
  info: '设置默认mode',
  command: ['mode'],
  argsInfo: '[mode]',
  args: ['onlyModeString'],
  argNecessity: [2],
  group: 'common',
  addUserToArg: true,
  helpInfo: {
    defaultHelp: true,
    customHelp: '',
    defaultDetail: true,
    customDetail: '',
  },
  /**
   * @param {import("../command/Arg")} arg
   * @param {{admin, host, nedb, commandsInfo, exscore}} globalConstant
   * @param {number} qqId 发送者Id
   */
  call: async (arg, globalConstant, qqId) => {
    const apiObjects = arg.getOsuApiObject()
    return await new UserInfo(globalConstant.host).setMode(globalConstant.nedb, qqId, apiObjects[0].m)
  },
}
