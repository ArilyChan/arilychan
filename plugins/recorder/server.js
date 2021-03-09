const express = require('express')
const path = require('path')
// const usage = require('./function/usage')

const app = express()
let usageUpdating = false
let usageCache = []
async function updateUsageCache (storage) {
  const data = await require('./function/usage')(storage)
  usageCache = [new Date(), data]
}

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'jsx')
app.engine('jsx', require('express-react-views').createEngine())
module.exports = (storage) => {
  app.get('/recent', (req, res) => {
    let recentKeys = Array.from(storage.messages.keys())
    recentKeys = recentKeys.slice(recentKeys.length - 100)
    const messages = recentKeys.map((key) => storage.messages.get(key))
    res.render('recent', {
      title: 'Recent replied messages',
      messages
    })
  })
  app.get('/stat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/usage.html'))
  })
  app.get('/stat/json', async (req, res) => {
    const now = new Date()
    if (!usageCache[0]) await updateUsageCache(storage)
    res.json(usageCache[1])
    if (now.getTime() - usageCache[0].getTime() > 1000 * 60 * 60 && !usageUpdating) {
      usageUpdating = true
      await updateUsageCache(storage)
      usageUpdating = false
    }
  })
  // app.use('/example', require('./example'))

  return app
}
