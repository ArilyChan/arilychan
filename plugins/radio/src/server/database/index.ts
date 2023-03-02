import { Context } from 'koishi'
import { BeatmapsetInfo, DatabaseBeatmapsetInfo } from '../../package/sayobot'
// import { MongoClient } from 'mongodb'
// import { newerThan, sortByInsertionOrderDesc, playlistUniqueBySid } from './aggregations'

declare module 'koishi' {
  export interface Tables {
    playlist: DatabaseBeatmapsetInfo
    // osuBeatmap: DatabaseBeatmapInfo['beatmap']
  }
}

export let lastAddedSong: DatabaseBeatmapsetInfo | undefined

export default async (ctx: Context, option: { expire?: number }) => {
  // const client = new MongoClient(uri)
  // await client.connect()

  // const database = client.db(dbName)
  // const collection = database.collection('radio-requests')

  const removeAfterDays = (option.expire || 7) + 1

  // ctx.model.extend('osuBeatmap', {
  //   AR: 'integer',
  //   CS: 'integer',
  //   HP: 'integer',
  //   OD: 'integer',
  //   aim: 'double',
  //   audio: 'string',
  //   bg: 'string',
  //   bid: 'integer',
  //   circles: 'integer',
  //   hit300window: 'integer',
  //   img: 'string',
  //   length: 'integer',
  //   maxcombo: 'integer',
  //   mode: 'integer',
  //   passcount: 'integer',
  //   playcount: 'integer',
  //   pp: 'double',
  //   pp_acc: 'double',
  //   pp_aim: 'double',
  //   pp_speed: 'double',
  //   sliders: 'integer',
  //   speed: 'double',
  //   spinners: 'integer',
  //   star: 'double',
  //   strain_aim: 'string',
  //   strain_speed: 'string',
  //   version: 'string'
  // }, {
  //   primary: 'bid'
  // })

  ctx.model.extend('playlist', {
    artist: 'string',
    artistU: 'string',
    title: 'string',
    titleU: 'string',
    sid: 'integer',
    creator: 'string',
    creator_id: 'integer',
    source: 'string',
    duration: 'integer',
    audioFileName: 'string',
    bgFileName: 'string',
    thumbImg: 'string',
    previewMp3: 'string',
    fullMp3: 'string',
    background: 'string',
    setLink: 'string',
    uploader: 'string',
    uuid: 'string',
    created: 'date',
    scope: 'string',
    guildId: 'string'
  }, {
    primary: 'uuid'
  })

  return {
    // collection,
    lastAddedSong,
    async addSongToList (song: DatabaseBeatmapsetInfo) {
      lastAddedSong = await ctx.database.create('playlist', song)
      return lastAddedSong
    },
    async removeSongFromList ({ uuid }) {
      // const result = await collection.findOne({ uuid })
      // if (!result) return null
      // if (lastAddedSong?.uuid === result.uuid) lastAddedSong = undefined
      // return collection.deleteOne({ uuid: result.uuid })
      const result = await ctx.database.get('playlist', { uuid })
      if (!result.length) {
        return null
      }
      const last = result[0]
      if (lastAddedSong?.uuid === last.uuid) lastAddedSong = undefined
      return await ctx.database.remove('playlist', { uuid: last.uuid })
    },
    async toPlaylist () {
      const d = new Date()
      d.setDate(d.getDate() - removeAfterDays)

      const playlist = await ctx.database.select('playlist')
        .where({
          created: {
            $gte: d
          }
        })
        .orderBy('created', 'desc')
      //   .groupBy('sid')
        .execute()

      const dedup = playlist.reduce((acc, cur) => {
        const { playlist, sids } = acc

        if (sids.has(cur.sid)) return acc

        playlist.push(cur)
        sids.add(cur.sid)
        return acc
      }, { playlist: <BeatmapsetInfo[]>[], sids: new Set<number>() })

      return dedup.playlist

      // return await collection.aggregate([
      //   ...newerThan(d),
      //   ...sortByInsertionOrderDesc(),
      //   ...playlistUniqueBySid(),
      //   ...sortByInsertionOrderDesc()
      // ]).toArray()
    }
  }
}
