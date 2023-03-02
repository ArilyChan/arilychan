"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSong = exports.pushSong = exports.broadcast = exports.emitter = void 0;
const events_1 = __importDefault(require("events"));
const database_1 = require("../database");
exports.emitter = new events_1.default();
let lastBroadcasted;
const broadcast = (ns, ...args) => exports.emitter.emit(ns, ...args);
exports.broadcast = broadcast;
const pushSong = (song) => {
    const lastSong = lastBroadcasted || database_1.lastAddedSong || undefined;
    if (lastSong?.sid === song.sid)
        return;
    (0, exports.broadcast)('search-result', song);
    lastBroadcasted = song;
};
exports.pushSong = pushSong;
const removeSong = (song) => {
    if (lastBroadcasted?.sid === song.sid)
        lastBroadcasted = undefined;
    (0, exports.broadcast)('remove-track', song);
};
exports.removeSong = removeSong;
