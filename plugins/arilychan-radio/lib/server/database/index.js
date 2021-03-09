// const songlist = new Map()
const { MongoClient } = require('mongodb')
const aggeregations = require('./aggregations')

let lastAddedSong

module.exports = async (option) => {
  const uri = option.db.uri || process.env.DB_URI || 'mongodb://localhost:27017/ArilyChan'
  const dbName = option.db.database || process.env.DB_DATABASE || 'ArilyChan'
  const removeAfterDays = (option.expire || 7) + 1

  const client = new MongoClient(uri)
  await client.connect()

  const database = client.db(dbName)
  const collection = database.collection('radio-requests')

  return {
    collection,
    // songlist,
    lastAddedSong,
    async songlistAdd (song) {
      // const uuid = song.uuid
      // const result = songlist.set(uuid, song)
      const result = await collection.insertOne(song)
      lastAddedSong = song
      return result
    },
    async songlistRemove ({ uuid }) {
      const result = await collection.findOne({ uuid })
      if (lastAddedSong && lastAddedSong.uuid === result.uuid) lastAddedSong = undefined
      return collection.deleteOne({ uuid: result.uuid })
    },
    async toPlaylist () {
      const d = new Date()
      d.setDate(d.getDate() - removeAfterDays)
      return await collection.aggregate([
        ...aggeregations.newerThan(d),
        ...aggeregations.sortByInsertionOrderDesc(),
        ...aggeregations.playlistUniqueBySid(),
        ...aggeregations.sortByInsertionOrderDesc()
      ]).toArray()
    }
  }
}
