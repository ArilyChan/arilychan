const utils = require('../utils');


class ModeStatsObject {
    constructor(modeStats) {
        if (modeStats) {
            this.accuracy = parseFloat(modeStats.accuracy.toFixed(2));
            this.playcount = modeStats.playcount;
            this.level = parseFloat(modeStats.level.toFixed(2));
            this.countryRank = modeStats.country_leaderboard_rank || 0;
            this.rank = modeStats.global_leaderboard_rank || 0;
            this.pp = modeStats.pp;
            this.rankedScores = modeStats.ranked_score;
            this.play_time = modeStats.play_time || 0;
        }
    }

    init(modeStatsJson) {
        this.accuracy = modeStatsJson.accuracy;
        this.playcount = modeStatsJson.playcount;
        this.level = modeStatsJson.level;
        this.countryRank = modeStatsJson.countryRank;
        this.rank = modeStatsJson.rank;
        this.pp = modeStatsJson.pp;
        this.rankedScores = modeStatsJson.rankedScores;
        this.play_time = modeStatsJson.play_time;

        return this;
    }

    toString() {
        let output = "";
        output = output + "acc：" + this.accuracy + "%\n";
        output = output + "等级：" + this.level + "\n";
        output = output + "pp：" + this.pp + "\n";
        output = output + "全服排名：#" + this.rank + "\n";
        //output = output + "本地排名：" + this.countryRank + "\n";
        output = output + "游玩次数：" + this.playcount + "\n";
        output = output + "rank总分：" + utils.format_number(this.rankedScores) + "\n";
        output = output + "游戏时长：" + utils.getUserTimePlayed(this.play_time) + "\n";

        return output;
    }

    // 由于js计算精度问题，所有数值计算均需转换成整数再计算
    addCompareString(nowValue, oldValue, digits = 0) {
        const multiplier = Math.pow(10, digits);
        let delta = (nowValue * multiplier - oldValue * multiplier) / multiplier;
        if (delta > 0) return " \t ( +" + delta.toFixed(digits) + " )\n";
        else if (delta < 0) return " \t ( " + delta.toFixed(digits) + " )\n";
        else return "\n";
    }

    addCompareAcc(nowValue, oldValue, digits = 0) {
        const multiplier = Math.pow(10, digits);
        let delta = (nowValue * multiplier - oldValue * multiplier) / multiplier;
        if (delta > 0) return " \t ( +" + delta.toFixed(digits) + "% )\n";
        else if (delta < 0) return " \t ( " + delta.toFixed(digits) + "% )\n";
        else return "\n";
    }


    addCompareRankedScores(nowValue, oldValue) {
        let delta = nowValue - oldValue;
        if (delta > 0) return " \t ( +" + utils.format_number(delta) + " )\n";
        else if (delta < 0) return " \t ( " + utils.format_number(delta) + " )\n";
        else return "\n";
    }

    addCompareUserTimePlayed(nowValue, oldValue) {
        let delta = nowValue - oldValue;
        if (delta > 0) return " \t ( +" + utils.getUserTimePlayed(delta) + " )\n";
        else if (delta < 0) return " \t ( " + utils.getUserTimePlayed(delta) + " )\n";
        else return "\n";
    }

    addCompareRank(nowValue, oldValue) {
        if (oldValue <= 0) return "\n"; // 原先没成绩
        let delta = nowValue - oldValue;
        if (delta > 0) return " \t ( ↓" + delta + " )\n";
        else if (delta < 0) return " \t ( ↑" + delta * -1 + " )\n";
        else return "\n";
    }

    /**
     * @param {ModeStatsObject} oldModeStats
     */
    compareTo(oldModeStats) {
        const dAccuracy = this.addCompareAcc(this.accuracy, oldModeStats.accuracy, 2);
        const dPlaycount = this.addCompareString(this.playcount, oldModeStats.playcount);
        const dLevel = this.addCompareString(this.level, oldModeStats.level, 2);
        //const dCountryRank = this.addCompareString(this.countryRank, oldModeStats.countryRank);
        const dRank = this.addCompareRank(this.rank, oldModeStats.rank);
        const dPP = this.addCompareString(this.pp, oldModeStats.pp);
        const dRankedScores = this.addCompareRankedScores(this.rankedScores, oldModeStats.rankedScores);
        const dPlay_time = this.addCompareUserTimePlayed(this.play_time, oldModeStats.play_time);

        let output = "";
        output = output + "acc：" + this.accuracy + "%" + dAccuracy;
        output = output + "等级：" + this.level + dLevel;
        output = output + "pp：" + this.pp + dPP;
        output = output + "全服排名：#" + this.rank + dRank;
        //output = output + "本地排名：" + this.countryRank + dCountryRank;
        output = output + "游玩次数：" + this.playcount + dPlaycount;
        output = output + "rank总分：" + utils.format_number(this.rankedScores) + dRankedScores;
        output = output + "游戏时长：" + utils.getUserTimePlayed(this.play_time) + dPlay_time;

        return output;
    }
}


module.exports = ModeStatsObject;