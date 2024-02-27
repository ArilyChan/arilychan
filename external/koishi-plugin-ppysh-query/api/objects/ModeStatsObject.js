const utils = require('../utils')

class ModeStatsObject {
  constructor(user) {
    if (user) {
      this.accuracy = Number.parseFloat(Number.parseFloat(user.accuracy).toFixed(2))
      this.playcount = Number.parseInt(user.playcount)
      this.level = Number.parseFloat(Number.parseFloat(user.level).toFixed(2))
      this.countryRank = Number.parseInt(user.pp_country_rank) || 0
      this.rank = Number.parseInt(user.pp_rank) || 0
      this.pp = Number.parseFloat(user.pp_raw)
      this.rankedScores = Number.parseInt(user.ranked_score)
      this.play_time = Number.parseInt(user.total_seconds_played) || 0
      this.count_rank_ss = Number.parseInt(user.count_rank_ss)
      this.count_rank_ssh = Number.parseInt(user.count_rank_ssh)
      this.count_rank_s = Number.parseInt(user.count_rank_s)
      this.count_rank_sh = Number.parseInt(user.count_rank_sh)
      this.count_rank_a = Number.parseInt(user.count_rank_a)
    }
  }

  init(modeStatsJson) {
    this.accuracy = modeStatsJson.accuracy
    this.playcount = modeStatsJson.playcount
    this.level = modeStatsJson.level
    this.countryRank = modeStatsJson.countryRank
    this.rank = modeStatsJson.rank
    this.pp = modeStatsJson.pp
    this.rankedScores = modeStatsJson.rankedScores
    this.play_time = modeStatsJson.play_time
    this.count_rank_ss = Number.parseInt(modeStatsJson.count_rank_ss)
    this.count_rank_ssh = Number.parseInt(modeStatsJson.count_rank_ssh)
    this.count_rank_s = Number.parseInt(modeStatsJson.count_rank_s)
    this.count_rank_sh = Number.parseInt(modeStatsJson.count_rank_sh)
    this.count_rank_a = Number.parseInt(modeStatsJson.count_rank_a)

    return this
  }

  toString() {
    let output = ''
    output = `${output}acc：${this.accuracy}%\n`
    output = `${output}等级：${this.level}\n`
    output = `${output}pp：${this.pp}\n`
    output = `${output}全球排名：#${this.rank}\n`
    output = `${output}本地排名：#${this.countryRank}\n`
    output = `${output}游玩次数：${this.playcount}\n`
    output = `${output}rank总分：${utils.format_number(this.rankedScores)}\n`
    output = `${output}游戏时长：${utils.getUserTimePlayed(this.play_time)}\n`

    output = `${output}SSH：${this.count_rank_ssh}\n`
    output = `${output}SS：${this.count_rank_ss}\n`
    output = `${output}SH：${this.count_rank_sh}\n`
    output = `${output}S：${this.count_rank_s}\n`
    output = `${output}A：${this.count_rank_a}\n`

    return output
  }

  // 由于js计算精度问题，所有数值计算均需转换成整数再计算
  addCompareString(nowValue, oldValue, digits = 0) {
    const multiplier = 10 ** digits
    const delta = (nowValue * multiplier - oldValue * multiplier) / multiplier
    if (delta > 0)
      return ` \t ( +${delta.toFixed(digits)} )\n`
    else if (delta < 0)
      return ` \t ( ${delta.toFixed(digits)} )\n`
    else return '\n'
  }

  addCompareAcc(nowValue, oldValue, digits = 0) {
    const multiplier = 10 ** digits
    const delta = (nowValue * multiplier - oldValue * multiplier) / multiplier
    if (delta > 0)
      return ` \t ( +${delta.toFixed(digits)}% )\n`
    else if (delta < 0)
      return ` \t ( ${delta.toFixed(digits)}% )\n`
    else return '\n'
  }

  addCompareRankedScores(nowValue, oldValue) {
    const delta = nowValue - oldValue
    if (delta > 0)
      return ` \t ( +${utils.format_number(delta)} )\n`
    else if (delta < 0)
      return ` \t ( ${utils.format_number(delta)} )\n`
    else return '\n'
  }

  addCompareUserTimePlayed(nowValue, oldValue) {
    const delta = nowValue - oldValue
    if (delta > 0)
      return ` \t ( +${utils.getUserTimePlayed(delta)} )\n`
    else if (delta < 0)
      return ` \t ( ${utils.getUserTimePlayed(delta)} )\n`
    else return '\n'
  }

  addCompareRank(nowValue, oldValue) {
    if (oldValue <= 0)
      return '\n' // 原先没成绩
    const delta = nowValue - oldValue
    if (delta > 0)
      return ` \t ( ↓${delta} )\n`
    else if (delta < 0)
      return ` \t ( ↑${delta * -1} )\n`
    else return '\n'
  }

  /**
   * @param {ModeStatsObject} oldModeStats
   */
  compareTo(oldModeStats) {
    const dAccuracy = this.addCompareAcc(this.accuracy, oldModeStats.accuracy, 2)
    const dPlaycount = this.addCompareString(this.playcount, oldModeStats.playcount)
    const dLevel = this.addCompareString(this.level, oldModeStats.level, 2)
    const dCountryRank = this.addCompareRank(this.countryRank, oldModeStats.countryRank)
    const dRank = this.addCompareRank(this.rank, oldModeStats.rank)
    const dPP = this.addCompareString(this.pp, oldModeStats.pp, 2)
    const dRankedScores = this.addCompareRankedScores(this.rankedScores, oldModeStats.rankedScores)
    const dPlay_time = this.addCompareUserTimePlayed(this.play_time, oldModeStats.play_time)

    const dSSH = this.addCompareString(this.count_rank_ssh, oldModeStats.count_rank_ssh)
    const dSS = this.addCompareString(this.count_rank_ss, oldModeStats.count_rank_ss)
    const dSH = this.addCompareString(this.count_rank_sh, oldModeStats.count_rank_sh)
    const dS = this.addCompareString(this.count_rank_s, oldModeStats.count_rank_s)
    const dA = this.addCompareString(this.count_rank_a, oldModeStats.count_rank_a)

    let output = ''
    output = `${output}acc：${this.accuracy}%${dAccuracy}`
    output = `${output}等级：${this.level}${dLevel}`
    output = `${output}pp：${this.pp}${dPP}`
    output = `${output}全球排名：#${this.rank}${dRank}`
    output = `${output}本地排名：#${this.countryRank}${dCountryRank}`
    output = `${output}游玩次数：${this.playcount}${dPlaycount}`
    output = `${output}rank总分：${utils.format_number(this.rankedScores)}${dRankedScores}`
    output = `${output}游戏时长：${utils.getUserTimePlayed(this.play_time)}${dPlay_time}`

    output = `${output}SSH：${this.count_rank_ssh}${dSSH}`
    output = `${output}SS：${this.count_rank_ss}${dSS}`
    output = `${output}SH：${this.count_rank_sh}${dSH}`
    output = `${output}S：${this.count_rank_s}${dS}`
    output = `${output}A：${this.count_rank_a}${dA}`

    return output
  }
}

module.exports = ModeStatsObject
