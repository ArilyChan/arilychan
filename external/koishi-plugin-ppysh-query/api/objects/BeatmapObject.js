"use strict";

const utils = require("../utils");
const MapCalculater = require("./MapCalculater");

class BeatmapObject {
    constructor(beatmap, mods = 0) {
        this.beatmapId = beatmap.beatmap_id;
        this.beatmapSetId = beatmap.beatmapset_id;
        this.mode = parseInt(beatmap.mode);
        this.beatmapMode = parseInt(beatmap.mode);
        this.artist = beatmap.artist;
        this.artist_unicode = (beatmap.artist_unicode) ? unescape(beatmap.artist_unicode) : this.artist;
        this.title = beatmap.title;
        this.title_unicode = (beatmap.title_unicode) ? unescape(beatmap.title_unicode) : this.title;
        this.diff = beatmap.version;
        this.creator = beatmap.creator;
        this.approved = utils.getApprovedString(beatmap.approved);
        this.bpm = beatmap.bpm;
        this.hit_length = parseInt(beatmap.hit_length);
        this.length = utils.gethitLengthString(beatmap.hit_length);
        this.maxCombo = beatmap.max_combo;
        this.cs = beatmap.diff_size;
        this.ar = beatmap.diff_approach;
        this.od = beatmap.diff_overall;
        this.hp = beatmap.diff_drain;
        this.stars = parseFloat(beatmap.difficultyrating);

        this.mods = mods;
    }

    async calculateWithMods(mode) {
        // 获取谱面信息
        let ppv2Options = {
            mods: this.mods,
            combo: this.maxcombo,
            nmiss: 0,
            acc: 100,
        }
        let mapCalculater = await new MapCalculater(this.beatmapId, ppv2Options).initFullPP();
        const map = mapCalculater.map;
        if (map.artist_unicode !== "") this.artist_unicode = map.artist;
        if (map.title_unicode !== "") this.title_unicode = map.title;
        if (mode === 0) {
            const ar = map.ar;
            const od = map.od;
            const hp = map.hp;
            const cs = map.cs;
            const resultStat = mapCalculater.calculateStatWithMods({ ar, od, hp, cs }, this.mods);
            this.cs = resultStat.cs;
            this.ar = resultStat.ar;
            this.od = resultStat.od;
            this.hp = resultStat.hp;
            this.bpm = this.bpm * resultStat.speed_mul;
            this.length = utils.gethitLengthString(this.hit_length / resultStat.speed_mul);
            this.stars = mapCalculater.stars.total;
            this.ppString = "PP: " + mapCalculater.sspp.total.toFixed(2) + "pp (aim: " + mapCalculater.sspp.aim.toFixed(0) + "  spd: " + mapCalculater.sspp.speed.toFixed(0) + "  acc: " + mapCalculater.sspp.acc.toFixed(0) + ")";
        }
    }

    toString() {
        let output = "";
        output = output + "谱面 " + this.beatmapId + " " + this.artist_unicode + " - " + this.title_unicode + "[" + this.diff + "] (" + this.creator + ")\n";
        output = output + "set： " + this.beatmapSetId + " 模式： " + utils.getModeString(this.beatmapMode) + " 状态： " + this.approved + "\n";
        output = output + "CS" + this.cs + "  AR" + this.ar + "  OD" + this.od + "  HP" + this.hp + "  BPM： " + this.bpm + " stars： " + this.stars.toFixed(2) + "\n";
        output = output + "max Combo： " + this.maxCombo + "  时长： " + this.length + "\n";
        output = output + "\n";
        output = output + "http://osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }

    toScoreTitle(scoremode) {
        // scoremode应为parseInt(apiObject.m)
        if (!scoremode) scoremode = this.beatmapMode;
        const scoreModeString = utils.getModeString(scoremode);
        return "谱面 " + this.beatmapId + " " + this.artist_unicode + " - " + this.title_unicode + "[" + this.diff + "] (" + this.creator + ") ★" + this.stars.toFixed(2) + " 的" + scoreModeString + "成绩：\n";
    }

    async toPPString() {
        if (this.mode !== 0) return "只支持查询std";
        await this.calculateWithMods(this.mode);
        let output = "";
        output = output + "谱面 " + this.beatmapId + " " + this.artist_unicode + " - " + this.title_unicode + " (" + this.creator + ") [" + this.diff + "]\n";
        output = output + "set： " + this.beatmapSetId + " 模式： " + utils.getModeString(this.mode) + " 状态： " + this.approved + "\n";
        output = output + "CS" + this.cs.toFixed(1) + "  AR" + this.ar.toFixed(1) + "  OD" + this.od.toFixed(1) + "  HP" + this.hp.toFixed(1) + "\n";
        output = output + "BPM: " + this.bpm.toFixed(0) + " stars: " + this.stars.toFixed(2) + " max Combo： " + this.maxCombo + "  时长： " + this.length + "\n";
        output = output + "使用mod：" + utils.getScoreModsString(this.mods) + "\n";
        output = output + this.ppString + "\n";
        output = output + "osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }

    async toPoolString() {
        if (this.mode !== 0) return "只支持查询std";
        await this.calculateWithMods(this.mode);
        let output = "";
        output = output + this.beatmapSetId + " " + this.artist_unicode + " - " + this.title_unicode + "[" + this.diff + "] // " + this.creator + "\n";
        output = output + "★" + this.stars.toFixed(2) + " BPM: " + this.bpm.toFixed(0) + "\n";
        output = output + "CS/AR/OD/HP: " + this.cs.toFixed(1) + " / " + this.ar.toFixed(1) + " / " + this.od.toFixed(1) + " / " + this.hp.toFixed(1) + "\n";
        output = output + "Length: " + this.length + "(" + this.maxCombo + "x)\n";
        output = output + "mod：" + utils.getScoreModsString(this.mods) + "\n";
        output = output + "osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }
}

module.exports = BeatmapObject;