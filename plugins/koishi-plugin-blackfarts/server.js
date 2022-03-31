const express = require('express')

const app = express()

app.set('views', __dirname + '/views')
app.set('view engine', 'jsx')
app.engine('jsx', require('express-react-views').createEngine())
module.exports = (storage, http) => {
  app.get('/recipe', (req, res) => {
    res.render('recipes', {
      title: 'recipes',
      recipes: storage.menu
    })
  })
  app.use('/art', express.static(__dirname + '/public/artwork'))
  app.use((req, res, next) => {
    console.log(req.url)
    next()
  })
  return app
}
