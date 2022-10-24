/* eslint-disable no-throw-literal */
'use strict'

const sayobot = require('../api/sayobot')
const osusearch = require('../api/osusearch')

class Arg {
  constructor (message) {
    this.message = message
  }

  /**
     * 判断字符串是否为正整数
     * @param {String} s
     * @returns {Boolean} 是正整数
     */
  checkInt (s) {
    const re = /^\d+$/
    return (re.test(s))
  }

  /**
     * 判断字符串是否包含非ASCII字符
     * @param {String} s
     * @returns {Boolean} 包含非ASCII字符
     */
  checkUnicode (s) {
    // eslint-disable-next-line no-control-regex
    const re = /[^\x00-\x7F]+/
    return (re.test(s))
  }

  /**
     * 获取搜索谱面参数
     * @param {String} s 1234567 或 "404" 或 artist - title(mapper)[diff_name]
     */
  getSearchData (s) {
    const data = {}
    // 检测unicode字符，如果有则使用sayabot搜索
    if (this.checkUnicode(s)) {
      // 取diff_name
      const diffStart = s.lastIndexOf('[')
      const diffEnd = s.lastIndexOf(']')
      if (diffStart >= 0 && diffEnd >= 0 && diffEnd - diffStart > 1) {
        data.diff_name = s.substring(diffStart + 1, diffEnd).trim()
        s = s.substring(0, diffStart) + s.substring(diffEnd + 1)
      }
      data.sayoTitle = s
      return data
    }
    // 1234567
    if (this.checkInt(s)) {
      data.beatmapSet = parseInt(s)
      return data
    }
    // "404"
    if ((s.length > 4) && (s.substring(0, 1) === '"') && (s.substring(s.length - 1) === '"')) {
      // 带引号强制字符串形式
      data.title = s.substring(1, s.length - 1)
      return data
    }
    // artist - title(mapper)[diff_name]
    // 先取mapper，因为mapper名字里可能有-[]
    const mapperStart = s.lastIndexOf('(')
    const mapperEnd = s.lastIndexOf(')')
    if (mapperStart >= 0 && mapperEnd >= 0 && mapperEnd - mapperStart > 1) {
      data.mapper = s.substring(mapperStart + 1, mapperEnd).trim()
      s = s.substring(0, mapperStart) + s.substring(mapperEnd + 1)
    }
    // 取artist
    const artistEnd = s.indexOf('-')
    if (artistEnd >= 0) {
      data.artist = s.substring(0, artistEnd).trim()
      s = s.substring(artistEnd + 1)
    }
    // 取diff_name
    const diffStart = s.lastIndexOf('[')
    const diffEnd = s.lastIndexOf(']')
    if (diffStart >= 0 && diffEnd >= 0 && diffEnd - diffStart > 1) {
      data.diff_name = s.substring(diffStart + 1, diffEnd).trim()
      s = s.substring(0, diffStart) + s.substring(diffEnd + 1)
    }
    // 取title
    data.title = s.trim()
    return data
  }

  async getBeatmapInfo () {
    if (!this.message) throw '请输入正确格式：artist - title(mapper)[diff_name] 或直接给出beatmapSetId，参数只有纯数字title请在前后加上双引号'
    const searchData = this.getSearchData(this.message)
    if (JSON.stringify(searchData) === '{}') throw '请输入正确格式：artist - title(mapper)[diff_name] 或直接给出beatmapSetId，参数只有纯数字title请在前后加上双引号'

    let beatmapSetId
    const diffName = searchData.diff_name || ''

    // 直接给出setId
    if (searchData.beatmapSet) beatmapSetId = searchData.beatmapSet

    // 用sayobot搜索谱面setId
    else if (searchData.sayoTitle) {
      beatmapSetId = await sayobot.searchList(searchData.sayoTitle)
      if (beatmapSetId.code) {
        throw beatmapSetId.message
      }
    // eslint-disable-next-line brace-style
    }

    // 用osusearch搜索谱面setId
    else {
      beatmapSetId = await osusearch.search(searchData)
      if (beatmapSetId.code) {
        throw beatmapSetId.message
      }
    }

    // 用sayobot获取谱面信息
    const beatmapInfo = await sayobot.search(beatmapSetId, diffName)
    if (beatmapInfo.code) {
      throw beatmapInfo.message
    }
    return beatmapInfo
  }
}

module.exports = Arg
