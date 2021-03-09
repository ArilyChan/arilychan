"use strict";

const utils = require('../utils');
const MapCalculater = require("./MapCalculater");

class ScoreObject {
    constructor(score, beatmapId) {
        this.beatmap_id = score.beatmap_id || beatmapId;  // get_score没有提供beatmapId
        this.user_id = score.user_id;

        this.time = score.date; // 字符串格式，YYYY-MM-DDTHH:MM:SSZ

        this.score = score.score;
        this.maxcombo = parseInt(score.maxcombo);
        this.count50 = parseInt(score.count50);
        this.count100 = parseInt(score.count100);
        this.count300 = parseInt(score.count300);
        this.countmiss = parseInt(score.countmiss);
        this.countkatu = parseInt(score.countkatu);
        this.countgeki = parseInt(score.countgeki);
        this.perfect = parseInt(score.perfect); //0,1

        this.mods = parseInt(score.enabled_mods);
        this.rank = score.rank;
        this.pp = parseFloat(score.pp) || 0; // recent没有提供pp

        this.errorMessage = "";
    }

    getPlayedDate() {
        return new Date(this.time);
    }

    toString() {
        const comboString = "combo: " + this.maxcombo + " \t ";
        const modsString = utils.getScoreModsString(this.mods);
        const ppString = (this.pp === 0) ? "" : this.pp.toFixed(2) + "pp";
        return comboString + utils.format_number(this.score) + " \t " + this.rank + " \t | " + modsString + " \t " + ppString;
    }

    async toCompleteString(mode, exScore = false) {
        this.calACC(mode);
        try {
            if (exScore) await this.extendScore(mode);
        }
        catch (ex) {
            console.log(ex);
            this.errorMessage = "获取谱面失败，缺少部分谱面信息，请重试";
        }
        let beatmapString = "";
        if (this.beatmapTitle) {
            beatmapString = this.beatmapTitle + "\n";
        }
        else {
            beatmapString = (this.beatmap_id) ? "beatmapId: " + this.beatmap_id + "\n" : "";
        }
        if (this.beatmapParams && this.stars) {
            beatmapString = beatmapString + this.beatmapParams + "  ★" + this.stars + "\n";
        }
        const userId = (this.user_id) ? "userId: " + this.user_id + "\n" : "";
        const accString = "ACC：" + this.acc.toFixed(2) + "%\n";
        const comboString = (this.fullCombo) ? "combo: " + this.maxcombo + " / " + this.fullCombo + "\n" : "combo: " + this.maxcombo + "\n";
        const modsString = "mod：" + utils.getScoreModsString(this.mods) + "\n";
        const rankString = "rank：" + this.rank + "\n";
        const scoreString = "分数：" + utils.format_number(this.score) + "\n";
        let counts = [];
        if (mode === 0) {// std
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 50 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        else if (mode === 1) {// taiko
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        else if (mode === 2) {// catch
            // 官方把drop翻译成水滴，把droplet翻译成小水滴，个人感觉怪怪的
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 水果 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 中果 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 果粒 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss水果 ");
            if (this.countkatu > 0) counts.push(" " + this.countkatu + "x miss果粒 ");
        }
        else if (mode === 3) {// mania
            if (this.countgeki > 0) counts.push(" " + this.countgeki + "x 彩300 ");
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.countkatu > 0) counts.push(" " + this.countkatu + "x 200 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 50 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        let ppString = "";
        if (this.ppString) {
            ppString = this.ppString + "\n" + this.fcppString + "\n" + this.ssppString + "\n";
        }
        else {
            ppString = (this.pp === 0 || this.completed === 0) ? "" : "pp：" + this.pp.toFixed(2) + "pp\n";
        }
        const playDate = "日期：" + this.getPlayedDate().toLocaleDateString();

        return this.errorMessage + beatmapString + userId + accString + comboString + modsString + rankString + scoreString + counts.join("|") + "\n" + ppString + playDate;
    }

    calACC(mode) {
        if (mode === 1) {
            const total = this.count100 + this.count300 + this.countmiss;
            this.acc = total === 0 ? 0 : (((this.count300 + this.count100 * .5) * 300) / (total * 300) * 100);
        }
        if (mode === 2) {
            const total = this.count50 + this.count100 + this.count300 + this.countkatu + this.countmiss;
            this.acc = total === 0 ? 0 : ((this.count50 + this.count100 + this.count300) / total * 100);
        }
        if (mode === 3) {
            const total = this.count50 + this.count100 + this.count300 + this.countkatu + this.countgeki + this.countmiss;
            this.acc = total === 0 ? 0 : ((this.count50 * 50 + this.count100 * 100 + this.countkatu * 200 + (this.count300 + this.countgeki) * 300) / (total * 300) * 100);
        }
        if (mode == 0) {
            const total = this.count50 + this.count100 + this.count300 + this.countmiss;
            this.acc = total === 0 ? 0 : ((this.count50 * 50 + this.count100 * 100 + this.count300 * 300) / (total * 300) * 100);
        }
    }

    async extendScore(mode) {
        // 获取谱面信息
        let mapCalculater = await new MapCalculater(this.beatmap_id, { mods: this.mods, combo: this.maxcombo, nmiss: this.countmiss, acc: this.acc }).init(mode);
        const map = mapCalculater.map;
        if (map.artist_unicode == "") map.artist_unicode = map.artist;
        if (map.title_unicode == "") map.title_unicode = map.title;
        this.beatmapTitle = "谱面 " + this.beatmap_id + " " + map.artist_unicode + " - " + map.title_unicode + " (" + map.creator + ") [" + map.version + "]";
        if (mode === 0) {
            const ar = map.ar;
            const od = map.od;
            const hp = map.hp;
            const cs = map.cs;
            const resultStat = mapCalculater.calculateStatWithMods({ ar, od, hp, cs }, this.mods);
            this.fullCombo = mapCalculater.maxcombo;
            this.beatmapParams = "CS" + resultStat.cs.toFixed(1) + "  AR" + resultStat.ar.toFixed(1) + "  OD" + resultStat.od.toFixed(1) + "  HP" + resultStat.hp.toFixed(1);
            this.stars = mapCalculater.stars.total.toFixed(2);
            this.ppString = "pp: " + mapCalculater.pp.total.toFixed(2) + "pp (aim: " + mapCalculater.pp.aim.toFixed(0) + "  spd: " + mapCalculater.pp.speed.toFixed(0) + "  acc: " + mapCalculater.pp.acc.toFixed(0) + ")";
            this.fcppString = "If FC: " + mapCalculater.fcpp.total.toFixed(2) + "pp (aim: " + mapCalculater.fcpp.aim.toFixed(0) + "  spd: " + mapCalculater.fcpp.speed.toFixed(0) + "  acc: " + mapCalculater.fcpp.acc.toFixed(0) + ")";
            this.ssppString = "If SS: " + mapCalculater.sspp.total.toFixed(2) + "pp (aim: " + mapCalculater.sspp.aim.toFixed(0) + "  spd: " + mapCalculater.sspp.speed.toFixed(0) + "  acc: " + mapCalculater.sspp.acc.toFixed(0) + ")";
        }
    }

}

module.exports = ScoreObject;