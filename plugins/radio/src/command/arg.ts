import { BeatmapInfo } from './../package/sayobot'
/* eslint-disable no-throw-literal */

import { sayobotApi as SayobotApi } from '../package/sayobot'
import { OsusearchApi as osusearch } from '../package/osusearch'

class Arg {
  message: string
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
  getSearchData (s: string) {
    const data: Partial<{
      sayoTitle: string,
      beatmapSet: number,
      title: string,
      mapper: string
      artist: string
      diff_name: string
    }> = {}
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
      data.beatmapSet = <number>parseInt(s)
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

    let beatmapSetId: number
    const diffName = searchData.diff_name || ''

    // 直接给出setId
    if (searchData.beatmapSet) beatmapSetId = searchData.beatmapSet

    // 用sayobot搜索谱面setId
    else if (searchData.sayoTitle) {
      const result = await SayobotApi.searchList(searchData.sayoTitle)
      if (result.code) {
        throw result.message
      }
      beatmapSetId = result
    // eslint-disable-next-line brace-style
    }

    // 用osusearch搜索谱面setId
    else {
      const result = await osusearch.search(searchData)
      if (result.code) {
        throw result.message
      }
      beatmapSetId = result
    }

    // 用sayobot获取谱面信息
    const beatmapInfo = await SayobotApi.search(beatmapSetId, diffName)
    if ('code' in beatmapInfo) {
      throw beatmapInfo.message
    }
    return beatmapInfo as BeatmapInfo
  }
}

export default Arg
