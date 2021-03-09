const EventEmitter = require('events')
const database = require('../database')

const emitter = new EventEmitter()
let lastBroadcasted

const broadcast = (...args) => emitter.emit(...args)

const pushSong = (song) => {
  const lastSong = lastBroadcasted || database.lastAddedSong || undefined
  if (lastSong && lastSong.sid === song.sid) return
  broadcast('search-result', song)
  lastBroadcasted = song
}

const removeSong = (song) => {
  if (lastBroadcasted && lastBroadcasted.sid === song.sid) lastBroadcasted = undefined
  broadcast('remove-track', song)
}

const exportModule = () => ({
  emitter,
  broadcast,
  pushSong,
  removeSong
})

module.exports = exportModule
