'use strict'

const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const nocache = require('nocache')
const app = express()
// TODO
const router = express.Router()
const publicDir = path.join(__dirname, '../../public')

module.exports = (option, storage, http) => {
  router.get('/', (req, res, next) => {
    // res.sendFile(path.join(publicDir, 'index.html'))
    res.redirect(`${option.web.path}/player`)
  })

  router.use(['/manifest.json', '/service-worker.js', '/player'], nocache())
  router.get('/player', (req, res, next) => {
    res.sendFile(path.join(publicDir, 'index.html'), {
      cacheControl: false
    })
  })
  router.get('/history', async (req, res, next) => {
    res.json(await storage.filteredPlaylistArray())
  })
  router.use(express.static(publicDir))

  app.use(router)

  const { emitter } = storage

  const io = socketIO(http, {
    path: '/Radio'
  })

  // emitter.on('search-result', (song) => io.sockets.emit('search-result', song))
  // emitter.on('broadcast-message', (user, message) => io.sockets.emit('search-result', song))

  ;['search-result', 'broadcast-message', 'remove-track']
    .map(eventName => emitter.on(eventName, (...args) => io.sockets.emit(eventName, ...args)))

  return app
}
