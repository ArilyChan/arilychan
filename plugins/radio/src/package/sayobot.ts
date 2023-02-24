import { ParsedUrlQueryInput, stringify } from 'querystring'
import { Agent } from 'https'
import axios from 'axios'
const { create } = axios
const axiosRu = create({
  httpsAgent: new Agent({
    rejectUnauthorized: false
  })
})

export class BeatmapInfo {
  uuid: string

  artist: string
  artistU: string
  title: string
  titleU: string
  sid: any
  creator: any
  creator_id: any
  source: any
  duration: number
  audioFileName: string
  bgFileName: string
  thumbImg: string
  previewMp3: string
  fullMp3: string | null
  background: string | null
  setLink: string

  beatmap: { length: any; audio: string; bg: string, version: string }
  uploader: unknown

  constructor (data: { artist: string; artistU: string; title: string; titleU: string; sid: any; creator: any; creator_id: any; source: any; bid_data: any[] }, SpecDiff = '') {
    this.artist = data.artist
    this.artistU = (data.artistU) ? data.artistU : data.artist
    this.title = data.title
    this.titleU = (data.titleU) ? data.titleU : data.title
    this.sid = data.sid
    this.creator = data.creator
    this.creator_id = data.creator_id
    this.source = data.source
    if (!SpecDiff) this.beatmap = data.bid_data.pop()
    else {
      data.bid_data.forEach((bData: this['beatmap']) => {
        const version = bData.version.toLowerCase()
        const diff = SpecDiff.toLowerCase()
        if (version.indexOf(diff) >= 0) this.beatmap = bData
      })
      if (!this.beatmap) this.beatmap = data.bid_data.pop()
    }
    // this.bid = this.beatmap.bid
    this.duration = this.beatmap.length
    this.audioFileName = this.beatmap.audio // 无音频则为""
    this.bgFileName = this.beatmap.bg // 无背景图则为""

    this.thumbImg = `https://cdn.sayobot.cn:25225/beatmaps/${this.sid}/covers/cover.jpg`
    this.previewMp3 = `https://cdn.sayobot.cn:25225/preview/${this.sid}.mp3`
    this.fullMp3 = (this.audioFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.audioFileName}` : null
    this.background = (this.bgFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.bgFileName}` : null

    this.setLink = `https://osu.ppy.sh/beatmapsets/${this.sid}`

    // this.createdAt = new Date()
    this.uploader = {}
  }
}

export class SearchResult {
  status: number
  beatmapInfo: BeatmapInfo
  constructor (result: { status: any; data: any }, SpecDiff?: string) {
    this.status = result.status
    if (this.status === 0) {
      this.beatmapInfo = new BeatmapInfo(result.data, SpecDiff)
    }
  }

  success () {
    return (this.status === 0)
  }
}

export class sayobotApi {
  static async apiRequestV2 (options?: ParsedUrlQueryInput) {
    const contents = (options) ? stringify(options) : ''
    const url = 'https://api.sayobot.cn/v2/beatmapinfo?' + contents
    const result = await axiosRu.get(url)
    return result.data
  }

  static async apiRequestList (keyword: string) {
    const url = 'https://api.sayobot.cn/beatmaplist?0=1&1=0&2=4&' + stringify({ 3: keyword })
    const result = await axiosRu.get(url)
    return result.data
  }

  /**
     * sayobot搜索谱面信息
     * @param {Number} sid setId
     * @param {String} diffName 难度名，为了获取指定难度的音频
     * @returns {BeatmapInfo|{code, message}} 返回BeatmapInfo，出错时返回 {code: "error"} 或 {code: 404}
     */
  static async search (sid: number, diffName: string) {
    const params = { K: sid, T: 0 } // T=1 匹配bid
    try {
      const result = await this.apiRequestV2(params)
      if (!result) return { code: 'error', message: '获取谱面详情失败' } as const
      const searchResult = new SearchResult(result, diffName)
      if (!searchResult.success()) return { code: 404, message: '查不到该谱面信息（谱面setId：' + sid + '）' } as const
      return searchResult.beatmapInfo
    } catch (ex) {
      console.log('[sayobot] ' + ex)
      return { code: 'error', message: '获取谱面详情出错' } as const
    }
  }

  /**
     * sayobot搜索谱面
     * @param {String} keyword
     * @returns {Number|{code, message}} 返回set id，出错时返回 {code: "error"} 或 {code: 404}
     */
  static async searchList (keyword: string) {
    try {
      const result = await this.apiRequestList(keyword)
      if (!result) return { code: 'error', message: '搜索谱面失败' }
      if (!result.data) return { code: 404, message: '找不到任何谱面（关键词：' + keyword + '）' }
      return result.data.pop().sid
    } catch (ex) {
      console.log('[sayobot] ' + ex)
      return { code: 'error', message: '搜索谱面出错' }
    }
  }
}
