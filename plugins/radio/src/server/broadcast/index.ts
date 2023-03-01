import { DatabaseBeatmapsetInfo } from '../../package/sayobot'
import EventEmitter from 'events'
import { lastAddedSong } from '../database'

export const emitter = new EventEmitter()
let lastBroadcasted

export const broadcast = (ns: string | symbol, ...args: unknown[]) => emitter.emit(ns, ...args)

export const pushSong = (song: DatabaseBeatmapsetInfo) => {
  const lastSong = lastBroadcasted || lastAddedSong || undefined
  if (lastSong?.sid === song.sid) return
  broadcast('search-result', song)
  lastBroadcasted = song
}

export const removeSong = (song: DatabaseBeatmapsetInfo) => {
  if (lastBroadcasted?.sid === song.sid) lastBroadcasted = undefined
  broadcast('remove-track', song)
}
