/// <reference types="node" />
import type { Guild, Uploader, UUID } from '../types';
import { ParsedUrlQueryInput } from 'querystring';
export interface SayoBeatmapData {
    AR: number;
    CS: number;
    HP: number;
    OD: number;
    aim: number;
    audio: string;
    bg: string;
    bid: number;
    circles: number;
    hit300window: number;
    img: string;
    length: number;
    maxcombo: number;
    mode: number;
    passcount: number;
    playcount: number;
    pp: number;
    pp_acc: number;
    pp_aim: number;
    pp_speed: number;
    sliders: number;
    speed: number;
    spinners: number;
    star: number;
    strain_aim: string;
    strain_speed: string;
    version: string;
}
export interface SayoBeatmapsetData {
    approved: number;
    approved_date: number;
    artist: string;
    artistU: string;
    bid_data: SayoBeatmapData[];
    bids_amount: number;
    bpm: number;
    creator: string;
    creator_id: number;
    favourite_count: number;
    genre: number;
    language: number;
    last_update: number;
    local_update: number;
    preview: number;
    sid: number;
    source: string;
    storyboard: number;
    tags: string;
    title: string;
    titleU: string;
    video: number;
}
export interface SayoBeatmapInfo {
    data: SayoBeatmapsetData;
    status: number;
}
export declare class BeatmapsetInfo {
    uuid: UUID;
    artist: string;
    artistU: string;
    title: string;
    titleU: string;
    sid: any;
    creator: any;
    creator_id: any;
    source: any;
    duration: number;
    audioFileName: string;
    bgFileName: string;
    thumbImg: string;
    previewMp3: string;
    fullMp3: string | null;
    background: string | null;
    setLink: string;
    uploader?: Uploader;
    constructor(data: SayoBeatmapsetData, SpecDiff?: string);
    static hydrate(data: BeatmapsetInfo): BeatmapsetInfo;
    static assertDatabaseReady(input: BeatmapsetInfo & Partial<DatabaseBeatmapsetInfo>): input is DatabaseBeatmapsetInfo;
}
export interface DatabaseBeatmapsetInfo extends Required<BeatmapsetInfo> {
    scope: 'public' | 'guild';
    guildId: this['scope'] extends 'public' ? never : Guild;
    created: Date;
}
export declare class SearchResult {
    status: number;
    beatmapInfo: BeatmapsetInfo;
    constructor(result: SayoBeatmapInfo, SpecDiff?: string);
    success(): boolean;
}
export declare class sayobotApi {
    static apiRequestV2(options?: ParsedUrlQueryInput): Promise<any>;
    static apiRequestList(keyword: string): Promise<any>;
    /**
       * sayobot搜索谱面信息
       * @param {Number} sid setId
       * @param {String} diffName 难度名，为了获取指定难度的音频
       * @returns {BeatmapsetInfo|{code, message}} 返回BeatmapInfo，出错时返回 {code: "error"} 或 {code: 404}
       */
    static search(sid: number, diffName: string): Promise<BeatmapsetInfo | {
        readonly code: "error";
        readonly message: "获取谱面详情失败";
    } | {
        readonly code: 404;
        readonly message: string;
    } | {
        readonly code: "error";
        readonly message: "获取谱面详情出错";
    }>;
    /**
       * sayobot搜索谱面
       * @param {String} keyword
       * @returns {Number|{code, message}} 返回set id，出错时返回 {code: "error"} 或 {code: 404}
       */
    static searchList(keyword: string): Promise<any>;
}
