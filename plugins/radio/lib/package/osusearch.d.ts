/// <reference types="node" />
import { ParsedUrlQueryInput } from 'querystring';
type SearchParam = {
    title: string;
    artist: string;
    mapper: any;
    diff_name: string;
    query_order: string;
};
export declare class OsusearchApi {
    static apiRequest(options: ParsedUrlQueryInput | undefined): Promise<any>;
    static findMostSuitable(result: any[], params: {
        diff_name?: any;
    }): any;
    static doSearch(_data: Partial<SearchParam>): Promise<any>;
    /**
       * osusearch搜索谱面
       * @returns {number | {code: number | string, message: string}} 返回id，出错时返回 {code: "error"} 或 {code: 404}
       */
    static search(data: Partial<{
        title: string;
        artist: string;
        mapper: string;
        diff_name: string;
    }>, type?: 'set' | 'id'): Promise<number | {
        code: string | number;
        message: string;
    }>;
}
export {};
