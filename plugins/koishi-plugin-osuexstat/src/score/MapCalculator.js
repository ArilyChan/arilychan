/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable new-cap */
// const ojsama = require("ojsama");

const { spawn, Worker } = require("threads");
// const utils = require("./utils");
const worker = spawn(new Worker("../workers/calculator-worker.js"));
class MapCalculator {
    /**
     * @param {String} beatmapFile
     * @param {Object} options
     * @param {Number} [options.mods=0]
     * @param {Number} [options.combo]
     * @param {Number} [options.nmiss=0]
     * @param {Number} [options.acc=100]
     */
    constructor(beatmapFile, options) {
        this.beatmapFile = beatmapFile;
        // (options.mods) ? this.mods = options.mods : 0;
        this.mods = options.mods || 0;
        // if (options.combo) this.combo = options.combo;
        this.combo = options.combo;
        // (options.nmiss) ? this.nmiss = options.nmiss : 0;
        this.nmiss = options.nmiss || 0;
        // (options.acc) ? this.acc = options.acc : 100;
        this.acc = options.acc || 100;

    }
    // getMap() {
    //     return new Promise((resolve) => {
    //         fs.readFile(this.beatmapFile, "utf-8", (err, data) => {
    //             if (err) throw err;
    //             resolve(data);
    //         });
    //     });
    // }
    calculateStatWithMods(values, mods) {
        // return new ojsama.std_beatmap_stats(values).with_mods(mods);
        return worker.then((worker) => worker.calculateStatWithMods({ values, mods }));
    }
    async init() {
        const result = await worker.then((worker) => worker.init(this.toJSON()));
        // return this;
        return Object.assign(this, result);
    }

    terminateWorker() {
        // return Thread.terminate(this.worker);
    }

    toJSON() {
        return { mods: this.mods, combo: this.combo, nmiss: this.nmiss, acc: this.acc, beatmapFile: this.beatmapFile };
    }
}
module.exports = MapCalculator;
