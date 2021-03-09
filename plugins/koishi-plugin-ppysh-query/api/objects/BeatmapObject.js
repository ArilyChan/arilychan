"use strict";

const utils = require("../utils");

class BeatmapObject {
    constructor(beatmap) {
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
        this.length = utils.gethitLengthString(beatmap.hit_length);
        this.maxCombo = beatmap.max_combo;
        this.cs = beatmap.diff_size;
        this.ar = beatmap.diff_approach;
        this.od = beatmap.diff_overall;
        this.hp = beatmap.diff_drain;
        this.stars = parseFloat(beatmap.difficultyrating);
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
}

module.exports = BeatmapObject;