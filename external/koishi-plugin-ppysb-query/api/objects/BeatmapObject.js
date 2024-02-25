"use strict";

const utils = require("../utils");

class BeatmapObject {
    constructor(beatmap, isRipple) {
        this.isRippleApi = isRipple;

        this.beatmapId = beatmap.beatmap_id;
        this.beatmapSetId = beatmap.beatmapset_id;
        if (!isRipple) this.mode = parseInt(beatmap.mode);
        if (!isRipple) this.beatmapMode = parseInt(beatmap.mode);
        if (!isRipple) this.artist = beatmap.artist;
        if (!isRipple) this.title = beatmap.title;
        if (!isRipple) this.diff = beatmap.version;
        // if (!isRipple) this.creator = beatmap.creator; ripple为空值
        if (isRipple) this.songName = beatmap.song_name;

        if (!isRipple) this.approved = utils.getApprovedString(beatmap.approved);
        if (isRipple) this.ranked = utils.getRippleRankedString(beatmap.ranked);

        if (!isRipple) this.bpm = beatmap.bpm;

        this.length = utils.gethitLengthString(beatmap.hit_length);
        this.maxCombo = beatmap.max_combo;

        // this.cs = beatmap.diff_size; ripple为空值
        this.ar = (isRipple) ? beatmap.ar : beatmap.diff_approach;
        this.od = (isRipple) ? beatmap.od : beatmap.diff_overall;
        // this.hp = beatmap.diff_drain; ripple为空值
        if (!isRipple) this.stars = parseFloat(beatmap.difficultyrating);
        if (isRipple) this.difficulty = beatmap.difficulty;
        if (isRipple) this.difficulty2 = beatmap.difficulty2;
    }

    toString() {
        let output = "";
        if (this.isRippleApi) {
            output = output + "谱面 " + this.beatmapId + " " + this.songName + "\n";
            output = output + "set： " + this.beatmapSetId + " 状态： " + this.ranked + "\n";
            output = output + "AR" + this.ar + "  OD" + this.od + "\n";
            if (this.difficulty2.std > 0) output = output + "std： " + this.difficulty2.std + "★  ";
            if (this.difficulty2.taiko > 0) output = output + "taiko： " + this.difficulty2.taiko + "★  ";
            if (this.difficulty2.ctb > 0) output = output + "ctb： " + this.difficulty2.ctb + "★  ";
            if (this.difficulty2.mania > 0) output = output + "mania： " + this.difficulty2.mania + "★  ";
            output = output + "\n";
        }
        else {
            output = output + "谱面 " + this.beatmapId + " " + this.artist + " - " + this.title + "[" + this.diff + "] " + "\n";
            output = output + "set： " + this.beatmapSetId + " 模式： " + utils.getModeString(this.beatmapMode) + " 状态： " + this.approved + "\n";
            output = output + "AR" + this.ar + "  OD" + this.od + "  BPM: " + this.bpm + " stars: " + this.stars.toFixed(2) + "\n";
        }
        output = output + "max Combo： " + this.maxCombo + "  时长： " + this.length + "\n";
        output = output + "\n";
        output = output + "http://osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }

    toScoreTitle(scoremode) {
        if (this.isRippleApi) { // scoremode应为score.play_mode
            let diff = "";
            if (scoremode === 0) diff = " ★" + this.difficulty2.std.toFixed(2);
            else if (scoremode === 1) diff = " ★" + this.difficulty2.taiko.toFixed(2);
            else if (scoremode === 2) diff = " ★" + this.difficulty2.ctb.toFixed(2);
            else if (scoremode === 3) diff = " ★" + this.difficulty2.mania.toFixed(2);
            else diff = " ★" + this.difficulty.toFixed(2);
            const scoreModeString = (scoremode || scoremode === 0) ? utils.getModeString(scoremode) : "";
            return "谱面 " + this.beatmapId + " " + this.songName + diff + " 的" + scoreModeString + "成绩：\n";
        }
        else {
            // scoremode应为parseInt(apiObject.m)
            if (!scoremode) scoremode = this.beatmapMode;
            const scoreModeString = utils.getModeString(scoremode);
            return "谱面 " + this.beatmapId + " " + this.artist + " - " + this.title + "[" + this.diff + "] " + " ★" + this.stars.toFixed(2) + " 的" + scoreModeString + "成绩：\n";
        }
    }
}

module.exports = BeatmapObject;