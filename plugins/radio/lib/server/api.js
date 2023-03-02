"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arg_1 = __importDefault(require("../command/arg"));
const sayobot_1 = require("../package/sayobot");
const database_1 = __importDefault(require("./database"));
const broadcast = __importStar(require("./broadcast"));
exports.default = async (ctx, option = {}) => {
    const database = await (0, database_1.default)(ctx, option);
    return {
        database,
        /** pushed events */
        emitter: broadcast.emitter,
        async search(msg) {
            const arg = new arg_1.default(msg);
            const beatmapInfo = await arg.getBeatmapInfo();
            return beatmapInfo;
        },
        /**
         * 检查歌曲是否在指定时间长度内
         */
        withinDurationLimit(beatmapInfo, limit = /* option.durationLimit || */ 10 * 60) {
            if (!beatmapInfo.duration)
                return false;
            return beatmapInfo.duration <= limit;
        },
        /**
         * 点歌
         */
        async add(song, guild) {
            const replica = {
                ...song,
                scope: guild ? 'guild' : 'public',
                guildId: guild,
                created: new Date()
            };
            if (!sayobot_1.BeatmapsetInfo.assertDatabaseReady(replica)) {
                throw new Error('validation failed');
            }
            if (!replica.uploader)
                throw new Error('unknown uploader');
            broadcast.pushSong(replica);
            const result = await database.addSongToList(replica);
            return result;
        },
        /**
         * 从playlist中删除指定歌曲
         * @param {String} uuid
         * @param {Object} uploader
         * @param {Number} uploader.id
         * @param {String} uploader.nickname
         * @returns {import('mongodb').WriteOpResult.result} WriteResult
         */
        async delete(song, uploader) {
            const result = await database.removeSongFromList(song);
            broadcast.removeSong({ ...song, uploader });
            return result;
        },
        /**
         * 广播
         * @param {Number|String} name qqId或其他东西
         * @param {String} msg message to send
         */
        async broadcast(name, msg) {
            broadcast.broadcast('broadcast-message', { name }, msg);
        },
        async filteredPlaylistArray() {
            return await database.toPlaylist();
        }
    };
};
