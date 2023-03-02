import type { Guild, Uploader } from '../types'
import Arg from '../command/arg'
import { BeatmapsetInfo, DatabaseBeatmapsetInfo } from '../package/sayobot'
import createDb from './database'
import * as broadcast from './broadcast'
import { Context } from 'koishi'

export default async (ctx: Context, option: {expire?: number} = {}) => {
  const database = await createDb(ctx, option)
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
     */
    withinDurationLimit (beatmapInfo: BeatmapsetInfo, limit = /* option.durationLimit || */ 10 * 60) {
      if (!beatmapInfo.duration) return false
      return beatmapInfo.duration <= limit
    },

    /**
     * 点歌
     */
    async add (song: BeatmapsetInfo, guild?: Guild) {
      const replica = {
        ...song,
        scope: guild ? 'guild' : 'public',
        guildId: guild as Guild,
        created: new Date()
      } as const

      if (!BeatmapsetInfo.assertDatabaseReady(replica)) {
        throw new Error('validation failed')
      }
      if (!replica.uploader) throw new Error('unknown uploader')
      broadcast.pushSong(replica)
      const result = await database.addSongToList(replica)
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
    async delete (song: DatabaseBeatmapsetInfo, uploader: Uploader) {
      const result = await database.removeSongFromList(song)
      broadcast.removeSong({ ...song, uploader })
      return result
    },

    /**
     * 广播
     * @param {Number|String} name qqId或其他东西
     * @param {String} msg message to send
     */
    async broadcast (name: string | number, msg: string) {
      broadcast.broadcast('broadcast-message', { name }, msg)
    },

    async filteredPlaylistArray () {
      return await database.toPlaylist()
    }

  }
}
