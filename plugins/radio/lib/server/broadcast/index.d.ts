/// <reference types="node" />
import { DatabaseBeatmapsetInfo } from '../../package/sayobot';
import EventEmitter from 'events';
export declare const emitter: EventEmitter;
export declare const broadcast: (ns: string | symbol, ...args: unknown[]) => boolean;
export declare const pushSong: (song: DatabaseBeatmapsetInfo) => void;
export declare const removeSong: (song: DatabaseBeatmapsetInfo) => void;
