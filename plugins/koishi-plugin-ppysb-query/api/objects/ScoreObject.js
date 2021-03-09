"use strict";

const utils = require('../utils');
const BeatmapObject = require('./BeatmapObject');
const SimpleUserObject = require("./SimpleUserObject");
const MapCalculater = require("./MapCalculater");

class ScoreObject {
    // ripple api的/recent和/best有beatmap没有user，/score有user没有beatmap
    constructor(score, beatmap, user) {

        if (score.beatmap) this.beatmap = new BeatmapObject(score.beatmap, true);
        else this.beatmap = beatmap;
        if (score.user) this.user = new SimpleUserObject(score.user)
        else this.user = user;

        this.time = score.time; // 字符串格式，YYYY-MM-DDTHH:MM:SSZ

        this.score = score.score;
        this.maxcombo = score.max_combo;
        this.count50 = score.count_50;
        this.count100 = score.count_100;
        this.count300 = score.count_300;
        this.countmiss = score.count_miss;
        this.countkatu = score.count_katu;
        this.countgeki = score.count_geki;

        this.mods = score.mods;
        this.date = score.time;
        this.rank = score.rank;
        this.pp = score.pp; // 非std图，recent获取的pp为0.001，未完成的pp为0

        this.completed = score.completed; // 0为未完成，2可能是非最好成绩，3可能是最好成绩

        this.acc = score.accuracy;
        this.mode = score.play_mode;
    }

    getPlayedDate() {
        return new Date(this.time);
    }

    toString() {
        const name = this.user.username + " \t ";
        const comboString = (this.mode === 0) ? this.maxcombo + "x/" + this.beatmap.maxCombo + "x \t " : "combo: " + this.maxcombo + " \t ";
        const accString = this.acc.toFixed(2) + "% \t ";
        const modsString = utils.getScoreModsString(this.mods);
        const ppString = (this.pp === 0 || this.completed === 0) ? "" : parseFloat(this.pp).toFixed(2) + "pp";
        return name + comboString + accString + utils.format_number(this.score) + " \t " + this.rank + " \t | " + modsString + " \t " + ppString;
    }

    async toCompleteString(exScore = false) {
        try {
            if (exScore) await this.extendScore();
        }
        catch (ex) {
            console.log(ex);
            this.errorMessage = "获取谱面文件失败，部分数据无法显示，请重试\n";
        }
        const name = "玩家：" + this.user.username + "\n";
        const comboString = (this.mode !== 0) ? "combo: " + this.maxcombo + "\n" : "combo: " + this.maxcombo + "/" + this.beatmap.maxCombo + "\n";
        const accString = "ACC：" + this.acc.toFixed(2) + "%\n";
        const modsString = "mod：" + utils.getScoreModsString(this.mods) + "\n";
        const rankString = "rank：" + this.rank + "\n";
        const ppString = (this.pp === 0 || this.completed === 0) ? "" : "pp：" + this.pp.toFixed(2) + "pp\n";
        const scoreString = "分数：" + utils.format_number(this.score) + "\n";
        let counts = [];
        if (this.mode === 0) {// std
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 50 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        else if (this.mode === 1) {// taiko
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        else if (this.mode === 2) {// catch
            // 官方把drop翻译成水滴，把droplet翻译成小水滴，个人感觉怪怪的
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 水果 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 中果 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 果粒 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss水果 ");
            if (this.countkatu > 0) counts.push(" " + this.countkatu + "x miss果粒 ");
        }
        else if (this.mode === 3) {// mania
            if (this.countgeki > 0) counts.push(" " + this.countgeki + "x 彩300 ");
            if (this.count300 > 0) counts.push(" " + this.count300 + "x 300 ");
            if (this.countkatu > 0) counts.push(" " + this.countkatu + "x 200 ");
            if (this.count100 > 0) counts.push(" " + this.count100 + "x 100 ");
            if (this.count50 > 0) counts.push(" " + this.count50 + "x 50 ");
            if (this.countmiss > 0) counts.push(" " + this.countmiss + "x miss ");
        }
        const playDate = "日期：" + this.getPlayedDate().toLocaleDateString();

        if (this.mode === 0 && exScore) {
            if (this.errorMessage) {
                return this.errorMessage + name + comboString + accString + modsString + rankString + ppString + scoreString + counts.join("|") + "\n" + playDate;
            }
            const trueStars = "计算星数：" + this.stars + "★\n";
            const truePrams = "计算四维：" + this.beatmapParams + "\n";
            const calPP = "插件计算：\n" + this.ppString + "\n" + this.fcppString + "\n" + this.ssppString + "\n由于服务器的pp计算公式不同，pp计算结果可能会有出入\n";
            return trueStars + truePrams + name + comboString + accString + modsString + rankString + ppString + scoreString + counts.join("|") + "\n" + calPP + playDate;
        }
        return name + comboString + accString + modsString + rankString + ppString + scoreString + counts.join("|") + "\n" + playDate;
    }

    async extendScore() {
        if (this.mode === 0) {
            let mapCalculater = await new MapCalculater(this.beatmap.beatmapId, { mods: this.mods, combo: this.maxcombo, nmiss: this.countmiss, acc: this.acc }).init(this.mode);
            const map = mapCalculater.map;
            const ar = map.ar;
            const od = map.od;
            const hp = map.hp;
            const cs = map.cs;
            const resultStat = mapCalculater.calculateStatWithMods({ ar, od, hp, cs }, this.mods);
            this.beatmapParams = "CS" + resultStat.cs.toFixed(1) + "  AR" + resultStat.ar.toFixed(1) + "  OD" + resultStat.od.toFixed(1) + "  HP" + resultStat.hp.toFixed(1);
            this.stars = mapCalculater.stars.total.toFixed(2);
            this.ppString = "pp: " + mapCalculater.pp.total.toFixed(2) + "pp (aim: " + mapCalculater.pp.aim.toFixed(0) + "  spd: " + mapCalculater.pp.speed.toFixed(0) + "  acc: " + mapCalculater.pp.acc.toFixed(0) + ")";
            this.fcppString = "If FC: " + mapCalculater.fcpp.total.toFixed(2) + "pp (aim: " + mapCalculater.fcpp.aim.toFixed(0) + "  spd: " + mapCalculater.fcpp.speed.toFixed(0) + "  acc: " + mapCalculater.fcpp.acc.toFixed(0) + ")";
            this.ssppString = "If SS: " + mapCalculater.sspp.total.toFixed(2) + "pp (aim: " + mapCalculater.sspp.aim.toFixed(0) + "  spd: " + mapCalculater.sspp.speed.toFixed(0) + "  acc: " + mapCalculater.sspp.acc.toFixed(0) + ")";
        }
    }
}

module.exports = ScoreObject;