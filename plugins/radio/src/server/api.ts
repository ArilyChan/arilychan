import Arg from '../command/arg'
import type { BeatmapInfo } from '../package/sayobot'

export default async (option: Record<string, unknown> = {}) => {
  const database = await require('./database').default(option)
  const broadcast = require('./broadcast').default(option)
  return {
    database,
    /** pushed events */
    emitter: broadcast.emitter,

    async search (msg: string) {
      const arg = new Arg(msg)
      const beatmapInfo = await arg.getBeatmapInfo()
      return beatmapInfo
    },

    /**
     * 检查歌曲是否在指定时间长度内
     * @param {import("./api/sayobot").BeatmapInfo} beatmapInfo
     * @param {Number} limit 秒数
     * @returns {Boolean} true为在limit内，option.durationLimit未定义则始终为true
     */
    withinDurationLimit (beatmapInfo: BeatmapInfo, limit = option.durationLimit || 10 * 60) {
      if (!beatmapInfo.duration) return false
      return beatmapInfo.duration <= limit
    },

    /**
     * 点歌
     * @param {Object} song
     * @returns {import('mongodb').WriteOpResult.result} WriteResult
     */
    async add (song) {
      const result = await database.songlistAdd(song)
      if (!song.uploader && !song.uploader.nickname) throw new Error('unknown uploader')
      broadcast.pushSong(song)
      return result
    },

    /**
     * 从playlist中删除指定歌曲
     * @param {String} uuid
     * @param {Object} uploader
     * @param {Number} uploader.id
     * @param {String} uploader.nickname
     * @returns {import('mongodb').WriteOpResult.result} WriteResult
     */
    async delete (song, uploader) {
      const result = await database.songlistRemove(song)
      broadcast.removeSong({ ...song, uploader })
      return result
    },

    /**
     * 广播
     * @param {Number|String} name qqId或其他东西
     * @param {String} msg message to send
     */
    async broadcast (name, msg) {
      broadcast.broadcast('broadcast-message', { name }, msg)
    },
    /**
     * to playlist
     * @returns {Promise<Array<BeatmapInfo>>}
     */
    filteredPlaylistArray () {
      return database.toPlaylist()
    }

  }
}
