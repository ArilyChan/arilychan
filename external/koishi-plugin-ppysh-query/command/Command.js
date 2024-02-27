'use strict'

// const CommandsInfo = require("./CommandsInfo");
const UserInfo = require('../user/UserInfo')
const Arg = require('./Arg')

class Command {
  /**
   * @param {string} qqId 发送者Id
   * @param {string} message 消息
   * @param {object} globalConstant
   * @param {Array<number>} globalConstant.admin 管理员列表
   * @param {string} globalConstant.apiKey osu apiKey
   * @param {string} globalConstant.host osu网址
   * @param {import("../database/nedb")} globalConstant.nedb 数据库
   * @param {import("./CommandsInfo")} globalConstant.commandsInfo 指令
   */
  constructor(qqId, message, globalConstant) {
    this.qqId = qqId
    /** @type {string} */
    this.msg = (message)
      ? message.trim().replace(/&#(x)?(\w+);/g, ($, $1, $2) => {
        return String.fromCharCode(Number.parseInt($2, $1 ? 16 : 10))
      })
      : ''
    this.commandString = ''
    this.argString = ''
    this.userInfo = { qqId, osuId: -1, osuName: '', defaultMode: '' }
    this.globalConstant = globalConstant
  }

  /**
   * 拆出指令和参数
   * @returns {boolean} 消息是否符合指令形式
   */
  cutCommand() {
    const commandReg = this.globalConstant.commandsInfo.commandReg
    const mr = commandReg.exec(this.msg)
    if (mr === null) { return false }
    else {
      this.commandString = mr[1].toLowerCase()
      this.argString = this.msg.substring(this.commandString.length).trim()
      return true
    }
  }

  async getUserInfo() {
    this.userInfo = await new UserInfo(this.globalConstant.host).getUserOsuInfo(this.qqId, this.globalConstant.nedb)
  }

  getNoArgErrorMessage(argName, argNecessity) {
    let errorMessage = '参数错误：'
    argName = argName.toLowerCase()
    if (argName.includes('userstringwithbeatmap') || argName.includes('userstringwithoutbeatmap'))
      errorMessage = `${errorMessage}缺少必要参数：玩家名`
    else if (argName.includes('beatmapstringwithuser') || argName.includes('beatmapstringwithoutuser'))
      errorMessage = `${errorMessage}缺少必要参数：谱面`
    else if (argName.includes('mode'))
      errorMessage = `${errorMessage}缺少必要参数：模式`
    else if (argName.includes('limit'))
      errorMessage = `${errorMessage}缺少必要参数：索引`
    else if (argName.includes('mods'))
      errorMessage = `${errorMessage}缺少必要参数：mod`
    if (argNecessity === 1)
      errorMessage = `${errorMessage}，绑定您的osu账号后可以省略`
    return errorMessage
  }

  /**
   * 分析argString
   * @param {object} commandInfo
   * @param {object} regs
   * @returns {Promise<Arg>}
   */
  async getArgObject(regs, commandInfo) {
    const args = {}
    /** @type {Array<string>} */
    const nedb = this.globalConstant.nedb
    const argsName = commandInfo.args
    /** @type {Array<-1|0|1>}  2：必须直接提供 1：user，必须提供，省略时从存储中寻找 0：mods，可省略，省略时从存储中寻找，如果找不到则省略 -1：可省略 */
    const argNecessity = commandInfo.argNecessity
    // 先去获取数据库
    await this.getUserInfo(nedb)
    // 比如me、setmode指令等没有userId参数，默认是查询已绑定账号
    if (commandInfo.addUserToArg)
      args.userStringWithoutBeatmap = this.userInfo.osuId
    argsName.map((argName, index) => {
      const ar = regs[argName].exec(this.argString)
      if (ar === null) {
        // 没匹配到该参数
        if (argNecessity[index] === 2) { throw this.getNoArgErrorMessage(argsName[index], 2) }
        else if (argNecessity[index] === 1) {
          if (argsName[index] === 'userStringWithoutBeatmap' && this.userInfo.osuId > 0)
            args.userStringWithoutBeatmap = this.userInfo.osuId
          else if (argsName[index] === 'userStringWithBeatmap' && this.userInfo.osuId > 0)
            args.userStringWithBeatmap = this.userInfo.osuId
          else if (argsName[index] === 'modeString' && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0))
            args.modeString = this.userInfo.defaultMode
          else if (argsName[index] === 'onlyModeString' && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0))
            args.onlyModeString = this.userInfo.defaultMode
          else throw this.getNoArgErrorMessage(argsName[index], 1)
        }
        else if (argNecessity[index] === 0) {
          if (argsName[index] === 'userStringWithoutBeatmap' && this.userInfo.osuId > 0)
            args.userStringWithoutBeatmap = this.userInfo.osuId
          else if (argsName[index] === 'userStringWithBeatmap' && this.userInfo.osuId > 0)
            args.userStringWithBeatmap = this.userInfo.osuId
          else if (argsName[index] === 'modeString' && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0))
            args.modeString = this.userInfo.defaultMode
          else if (argsName[index] === 'onlyModeString' && (this.userInfo.defaultMode || this.userInfo.defaultMode === 0))
            args.onlyModeString = this.userInfo.defaultMode
        }
      }
      else {
        args[argName] = ar[1]
      }
    })
    return new Arg(args)
  }

  getHelp() {
    const prefix = this.globalConstant.commandsInfo.prefixs[0]
    const commands = this.globalConstant.commandsInfo.commands
    let output = ''
    if (!this.argString) {
      // 输出全部指令
      output = `${output}osu.ppy.sh 简略查询\n`
      for (const com of commands) {
        if (com.adminCommand)
          continue // 不显示管理员指令
        if (!com.helpInfo.defaultHelp)
          output = `${output + prefix + com.helpInfo.customHelp}\n`
        else output = `${output + prefix + com.command[0]} ${com.info}\n`
      }
      output = `${output}\n`
      output = `${output + prefix}help + 指令 可以查询该指令详细信息\n`
      // output = output + "基本指令有：" + commands.reduce((acc, cur) => { return acc + cur.command[0] + "/" }, "");
      return output
    }
    // 查找指令
    for (const com of commands) {
      if (com.command.includes(this.argString)) {
        if (!com.helpInfo.defaultDetail) { return com.helpInfo.customDetail }
        else {
          output = `${output + com.info}\n`
          output = `${output}指令：${com.command.join('/')}\n`
          output = `${output}参数：${com.argsInfo}`
          return output
        }
      }
    }
    return `没有 ${this.argString} 这个指令呢`
  }

  checkAdmin() {
    if (!this.globalConstant.admin.includes(this.qqId))
      return false
    else return true
  }

  /**
   * 运行指令
   */
  async execute() {
    try {
      if (!this.cutCommand())
        return '' // 指令格式不正确
      // 帮助
      if (this.commandString === 'help')
        return this.getHelp()

      // 查找指令
      const commands = this.globalConstant.commandsInfo.commands
      for (const com of commands) {
        if (com.command.includes(this.commandString)) {
          if (com.adminCommand && !this.checkAdmin())
            return '该指令需要管理员权限'
          const arg = await this.getArgObject(this.globalConstant.commandsInfo.regs, com)
          return await com.call(arg, this.globalConstant, this.qqId)
        }
      }
      return '' // 找不到该指令
    }
    catch (ex) {
      return ex
    }
  }
}

module.exports = Command