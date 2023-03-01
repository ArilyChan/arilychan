import { join } from 'path'
import express, { Router, static as _static } from 'express'
import { Server } from 'socket.io'
import nocache from 'nocache'
const app = express()

const router = Router()
const publicDir = join(__dirname, '../../public')

export default (option, storage, http) => {
  router.get('/', (req, res, next) => {
    // res.sendFile(path.join(publicDir, 'index.html'))
    res.redirect(`${option.web.path}/player`)
  })

  router.use(['/manifest.json', '/service-worker.js', '/player'], nocache())
  router.get('/player', (req, res, next) => {
    res.sendFile(join(publicDir, 'index.html'), {
      cacheControl: false
    })
  })
  router.get('/history', async (req, res, next) => {
    res.json(await storage.filteredPlaylistArray())
  })
  router.use(_static(publicDir))

  app.use(router)

  const { emitter } = storage

  const io = new Server(http, {
    path: '/Radio'
  })

  // emitter.on('search-result', (song) => io.sockets.emit('search-result', song))
  // emitter.on('broadcast-message', (user, message) => io.sockets.emit('search-result', song))

  ;['search-result', 'broadcast-message', 'remove-track']
    .map(eventName => emitter.on(eventName, (...args) => io.sockets.emit(eventName, ...args)))

  return app
}
