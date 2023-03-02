import { Context } from 'koishi';
import { BeatmapsetInfo, DatabaseBeatmapsetInfo } from '../../package/sayobot';
declare module 'koishi' {
    interface Tables {
        playlist: DatabaseBeatmapsetInfo;
    }
}
export declare let lastAddedSong: DatabaseBeatmapsetInfo | undefined;
declare const _default: (ctx: Context, option: {
    expire?: number;
}) => Promise<{
    lastAddedSong: DatabaseBeatmapsetInfo | undefined;
    addSongToList(song: DatabaseBeatmapsetInfo): Promise<DatabaseBeatmapsetInfo>;
    removeSongFromList({ uuid }: {
        uuid: any;
    }): Promise<void | null>;
    toPlaylist(): Promise<BeatmapsetInfo[]>;
}>;
export default _default;
