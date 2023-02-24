import EventEmitter from 'events'
import { lastAddedSong } from '../database'

const emitter = new EventEmitter()
let lastBroadcasted

const broadcast = (ns: string | symbol, ...args: unknown[]) => emitter.emit(ns, ...args)

const pushSong = (song) => {
  const lastSong = lastBroadcasted || lastAddedSong || undefined
  if (lastSong?.sid === song.sid) return
  broadcast('search-result', song)
  lastBroadcasted = song
}

const removeSong = (song) => {
  if (lastBroadcasted?.sid === song.sid) lastBroadcasted = undefined
  broadcast('remove-track', song)
}

const exportModule = () => ({
  emitter,
  broadcast,
  pushSong,
  removeSong
})

export default exportModule
