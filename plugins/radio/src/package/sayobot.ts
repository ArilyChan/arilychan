import type { Guild, Uploader, UUID } from '../types'
import { ParsedUrlQueryInput, stringify } from 'querystring'
import { Agent } from 'https'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const { create } = axios
const axiosRu = create({
  httpsAgent: new Agent({
    rejectUnauthorized: false
  })
})
export interface SayoBeatmapData {
    AR: number;
    CS: number;
    HP: number;
    OD: number;
    aim: number;
    audio: string;
    bg: string;
    bid: number;
    circles: number;
    hit300window: number;
    img: string;
    length: number;
    maxcombo: number;
    mode: number;
    passcount: number;
    playcount: number;
    pp: number;
    pp_acc: number;
    pp_aim: number;
    pp_speed: number;
    sliders: number;
    speed: number;
    spinners: number;
    star: number;
    strain_aim: string;
    strain_speed: string;
    version: string;
}
export interface SayoBeatmapsetData {
    approved: number;
    approved_date: number;
    artist: string;
    artistU: string;
    bid_data: SayoBeatmapData[];
    bids_amount: number;
    bpm: number;
    creator: string;
    creator_id: number;
    favourite_count: number;
    genre: number;
    language: number;
    last_update: number;
    local_update: number;
    preview: number;
    sid: number;
    source: string;
    storyboard: number;
    tags: string;
    title: string;
    titleU: string;
    video: number;
}
export interface SayoBeatmapInfo {
    data: SayoBeatmapsetData;
    status: number;
}

export class BeatmapsetInfo {
  uuid: UUID
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

  // beatmap: SayoBeatmapData
  uploader?: Uploader

  constructor (data: SayoBeatmapsetData, SpecDiff = '') {
    this.artist = data.artist
    this.artistU = (data.artistU) ? data.artistU : data.artist
    this.title = data.title
    this.titleU = (data.titleU) ? data.titleU : data.title
    this.sid = data.sid
    this.creator = data.creator
    this.creator_id = data.creator_id
    this.source = data.source
    if (!data.bid_data.length) throw new Error('beatmapSet without beatmap?')

    let beatmap: SayoBeatmapData

    if (SpecDiff) {
      beatmap = data.bid_data.find((bData) => {
        const version = bData.version.toLowerCase()
        const diff = SpecDiff.toLowerCase()
        return (version.indexOf(diff) >= 0)
      }) || data.bid_data.pop() as SayoBeatmapData
    } else {
      beatmap = data.bid_data.pop() as SayoBeatmapData
    }

    this.duration = beatmap.length
    this.audioFileName = beatmap.audio // 无音频则为""
    this.bgFileName = beatmap.bg // 无背景图则为""

    this.thumbImg = `https://cdn.sayobot.cn:25225/beatmaps/${this.sid}/covers/cover.jpg`
    this.previewMp3 = `https://cdn.sayobot.cn:25225/preview/${this.sid}.mp3`
    this.fullMp3 = (this.audioFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.audioFileName}` : null
    this.background = (this.bgFileName) ? `https://dl.sayobot.cn/beatmaps/files/${this.sid}/${this.bgFileName}` : null

    this.setLink = `https://osu.ppy.sh/beatmapsets/${this.sid}`

    this.uuid = uuidv4()
  }

  static hydrate (data: BeatmapsetInfo): BeatmapsetInfo {
    return Object.setPrototypeOf(data, BeatmapsetInfo.prototype)
  }

  // eslint-disable-next-line no-use-before-define
  static assertDatabaseReady (input: BeatmapsetInfo & Partial<DatabaseBeatmapsetInfo>): input is DatabaseBeatmapsetInfo {
    return (input.scope === 'guild' && Boolean(input.guildId)) ||
    input.scope === 'public'
  }
}

export interface DatabaseBeatmapsetInfo extends Required<BeatmapsetInfo> {
  scope: 'public' | 'guild'
  guildId: this['scope'] extends 'public' ? never : Guild,
  created: Date
}

export class SearchResult {
  status: number
  beatmapInfo: BeatmapsetInfo

  constructor (result: SayoBeatmapInfo, SpecDiff?: string) {
    this.status = result.status
    if (this.status === 0) {
      this.beatmapInfo = new BeatmapsetInfo(result.data, SpecDiff)
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
     * @returns {BeatmapsetInfo|{code, message}} 返回BeatmapInfo，出错时返回 {code: "error"} 或 {code: 404}
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
