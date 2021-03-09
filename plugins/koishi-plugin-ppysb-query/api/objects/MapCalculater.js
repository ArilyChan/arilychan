"use strict";

const fetch = require('node-fetch')
const ojsama = require("ojsama");

class MapCalculater {
    /**
     * @param {Number} beatmapId 
     * @param {Object} options 
     * @param {Number} [options.mods=0]
     * @param {Number} [options.combo]
     * @param {Number} [options.nmiss=0]
     * @param {Number} [options.acc=100]
     */
    constructor(beatmapId, options) {
        this.beatmapId = beatmapId;
        (options.mods) ? this.mods = options.mods : 0;
        if (options.combo) this.combo = options.combo;
        (options.nmiss) ? this.nmiss = options.nmiss : 0;
        (options.acc) ? this.acc = options.acc : 100;
    }

    async getMap() {
        const rawBeatmap = await fetch(`https://osu.ppy.sh/osu/${this.beatmapId}`, { credentials: 'include' }).then(res => res.text());
        const { map } = new ojsama.parser().feed(rawBeatmap);
        return map;
    }

    calculateStatWithMods(values, mods) {
        return new ojsama.std_beatmap_stats(values).with_mods(mods);
    }

    async init(mode) {
        this.map = await this.getMap();
        // 以下为std独有
        if (mode == 0) {
            this.maxcombo = this.map.max_combo();
            if (!this.combo) this.combo = this.maxcombo;
            this.stars = new ojsama.diff().calc({ map: this.map, mods: this.mods });
            this.pp = ojsama.ppv2({
                stars: this.stars,
                combo: this.combo,
                nmiss: this.nmiss,
                acc_percent: this.acc,
            });
            this.fcpp = ojsama.ppv2({
                stars: this.stars,
                combo: this.maxcombo,
                nmiss: 0,
                acc_percent: this.acc,
            });
            this.sspp = ojsama.ppv2({
                stars: this.stars,
                combo: this.maxcombo,
                nmiss: 0,
                acc_percent: 100,
            });
        }
        return this;
    }
}

module.exports = MapCalculater;