/* eslint-disable no-throw-literal */
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
const { default: PQueue } = require("p-queue");

class beatmapDownloader {
    constructor(saveDir) {
        this.saveDir = saveDir;
    }
    async downloadMap(bid, times = 0) {
        const filePath = path.join(this.saveDir, `./${bid}.osu`);
        const MAX_RETRY = 20;
        try {
            const beatmapData = await fetch(`https://osu.ppy.sh/osu/${bid}`, {
                method: "GET",
                headers: { "Content-Type": "application/octet-stream" },
                credentials: "include",
                timeout: 10000,
            }).then((res) => res.text());
            console.log("保存为文件" + bid + ".osu");
            await fs.writeFile(filePath, beatmapData, "utf-8", (err) => {
                if (err) throw (err);
            });
            return true;
        }
        catch (ex) {
            if (times >= MAX_RETRY) throw "下载" + bid + "时超过最大重试次数，暂停下载";
            console.log("下载" + bid + "失败，第" + (times + 1) + "次重试");
            return this.downloadMap(bid, times + 1);
        }
    }
    async downloadQueue(beatmaps) {
        try {
            const queue = new PQueue({ concurrency: 1 });
            queue.addAll(beatmaps.map((bid, index) => () => {
                console.log("[" + (index + 1) + "/" + beatmaps.length + "]开始下载" + bid);
                return this.downloadMap(bid);
            }));
            // for (let i = 0; i < beatmaps.length; i++) {
            //     console.log("[" + (i + 1) + "/" + beatmaps.length + "]开始下载" + beatmaps[i]);
            //     const result = await this.downloadMap(beatmaps[i]);
            //     if (result) continue;
            //     else break;
            // }
            // console.log("下载队列完成！");
            await queue.onIdle();
            console.log("下载队列完成！");
            return true;
        }
        catch (ex) {
            console.log(ex);
            return false;
        }
    }
}
module.exports = beatmapDownloader;
