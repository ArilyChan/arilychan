import type { Guild, Uploader } from '../types';
import { BeatmapsetInfo, DatabaseBeatmapsetInfo } from '../package/sayobot';
import { Context } from 'koishi';
declare const _default: (ctx: Context, option?: {
    expire?: number;
}) => Promise<{
    database: {
        lastAddedSong: DatabaseBeatmapsetInfo | undefined;
        addSongToList(song: DatabaseBeatmapsetInfo): Promise<DatabaseBeatmapsetInfo>;
        removeSongFromList({ uuid }: {
            uuid: any;
        }): Promise<void | null>;
        toPlaylist(): Promise<BeatmapsetInfo[]>;
    };
    /** pushed events */
    emitter: import("events");
    search(msg: string): Promise<BeatmapsetInfo>;
    /**
     * 检查歌曲是否在指定时间长度内
     */
    withinDurationLimit(beatmapInfo: BeatmapsetInfo, limit?: number): boolean;
    /**
     * 点歌
     */
    add(song: BeatmapsetInfo, guild?: Guild): Promise<DatabaseBeatmapsetInfo>;
    /**
     * 从playlist中删除指定歌曲
     * @param {String} uuid
     * @param {Object} uploader
     * @param {Number} uploader.id
     * @param {String} uploader.nickname
     * @returns {import('mongodb').WriteOpResult.result} WriteResult
     */
    delete(song: DatabaseBeatmapsetInfo, uploader: Uploader): Promise<void | null>;
    /**
     * 广播
     * @param {Number|String} name qqId或其他东西
     * @param {String} msg message to send
     */
    broadcast(name: string | number, msg: string): Promise<void>;
    filteredPlaylistArray(): Promise<BeatmapsetInfo[]>;
}>;
export default _default;
