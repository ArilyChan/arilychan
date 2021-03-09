const MongoClient = require('mongodb').MongoClient

module.exports = async (options) => {
  const client = new MongoClient(options.db.uri, { useUnifiedTopology: true })
  await client.connect()
  return client.db()
}
