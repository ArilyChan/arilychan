// const songlist = new Map()
const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')

module.exports = async (option) => {
  if (!option.db) option.db = {}
  const uri = option.db.uri || process.env.DB_URI || 'mongodb://localhost:27017/ArilyChan'
  const dbName = option.db.database || process.env.DB_DATABASE || 'ArilyChan'

  const client = new MongoClient(uri)
  await client.connect()

  const database = client.db(dbName)
  const collection = database.collection('auth-token')

  return {
    collection,
    async createAuth (token) {
      const document = {
        token: token || uuidv4(),
        status: 'waiting'
      }
      const result = await collection.insertOne(document)
      if (result.insertedCount) return document
      else return false
    },
    removeAuthForQQ (qq) {
      return collection.deleteMany({ qq })
    },
    removeAuthForToken (token) {
      return collection.deleteMany({ token })
    },
    async authenticateTokenToQQ (token, qq) {
      return await collection.findOneAndUpdate({ token }, { $set: { status: 'authenticated', qq } })
    },
    async deauthenticate (token) {
      return await collection.findOneAndUpdate({ token }, { $set: { status: 'revoked' } })
    },
    async getStat (token) {
      return await collection.findOne({ token })
    }
  }
}
