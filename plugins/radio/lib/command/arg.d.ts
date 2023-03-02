declare class Arg {
    message: string;
    constructor(message: any);
    /**
       * 判断字符串是否为正整数
       * @param {String} s
       * @returns {Boolean} 是正整数
       */
    checkInt(s: any): boolean;
    /**
       * 判断字符串是否包含非ASCII字符
       * @param {String} s
       * @returns {Boolean} 包含非ASCII字符
       */
    checkUnicode(s: any): boolean;
    /**
       * 获取搜索谱面参数
       * @param {String} s 1234567 或 "404" 或 artist - title(mapper)[diff_name]
       */
    getSearchData(s: string): Partial<{
        sayoTitle: string;
        beatmapSet: number;
        title: string;
        mapper: string;
        artist: string;
        diff_name: string;
    }>;
    getBeatmapInfo(): Promise<import("../package/sayobot").BeatmapsetInfo>;
}
export default Arg;
