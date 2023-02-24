import { MongoClient } from 'mongodb'
import { newerThan, sortByInsertionOrderDesc, playlistUniqueBySid } from './aggregations'

export let lastAddedSong

export default async (option) => {
  const uri = option.db.uri || process.env.DB_URI || 'mongodb://localhost:27017/ArilyChan'
  const dbName = option.db.database || process.env.DB_DATABASE || 'ArilyChan'
  const removeAfterDays = (option.expire || 7) + 1

  const client = new MongoClient(uri)
  await client.connect()

  const database = client.db(dbName)
  const collection = database.collection('radio-requests')

  return {
    collection,
    lastAddedSong,
    async listAdd (song) {
      const result = await collection.insertOne(song)
      lastAddedSong = song
      return result
    },
    async listRemove ({ uuid }) {
      const result = await collection.findOne({ uuid })
      if (!result) return null
      if (lastAddedSong?.uuid === result.uuid) lastAddedSong = undefined
      return collection.deleteOne({ uuid: result.uuid })
    },
    async toPlaylist () {
      const d = new Date()
      d.setDate(d.getDate() - removeAfterDays)
      return await collection.aggregate([
        ...newerThan(d),
        ...sortByInsertionOrderDesc(),
        ...playlistUniqueBySid(),
        ...sortByInsertionOrderDesc()
      ]).toArray()
    }
  }
}
