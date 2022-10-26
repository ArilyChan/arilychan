/* eslint-disable complexity */
/* eslint-disable default-case */
/* eslint-disable radix */
class utils {
    // 整数每3位加逗号
    static format_number(n) {
        const b = parseInt(n).toString();
        const len = b.length;
        if (len <= 3) return b;
        const r = len % 3;
        return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
    }
    // enabled_mods转为mods数组
    static getScoreMods(enabledMods) {
        const raw_mods = parseInt(enabledMods);
        const Mods = {
            "None": 0,
            "NoFail": 1,
            "Easy": 1 << 1,
            "TouchDevice": 1 << 2,
            "Hidden": 1 << 3,
            "HardRock": 1 << 4,
            "SuddenDeath": 1 << 5,
            "DoubleTime": 1 << 6,
            "Relax": 1 << 7,
            "HalfTime": 1 << 8,
            "Nightcore": 1 << 9, // DoubleTime
            "Flashlight": 1 << 10,
            "Autoplay": 1 << 11,
            "SpunOut": 1 << 12,
            "Autopilot": 1 << 13, // Relax2
            "Perfect": 1 << 14, // SuddenDeath
            "Key4": 1 << 15,
            "Key5": 1 << 16,
            "Key6": 1 << 17,
            "Key7": 1 << 18,
            "Key8": 1 << 19,
            "FadeIn": 1 << 20,
            "Random": 1 << 21,
            "Cinema": 1 << 22,
            "Target": 1 << 23,
            "Key9": 1 << 24,
            "KeyCoop": 1 << 25,
            "Key1": 1 << 26,
            "Key3": 1 << 27,
            "Key2": 1 << 28,
            "ScoreV2": 1 << 29,
            "Mirror": 1 << 30,
            "KeyMod": 521109504,
            "FreeModAllowed": 522171579,
            "ScoreIncreaseMods": 1049662
        };
        const modsArr = [];
        for (const mod in Mods) if (raw_mods & Mods[mod]) modsArr.push(mod);
        return modsArr;
    }
    // enabled_mods转为字符串
    static getScoreModsString(enabledMods) {
        const modsArr = this.getScoreMods(enabledMods);
        const abbMods = [];
        let hasV2 = false;
        let hasRelax = false;
        for (let i = 0; i < modsArr.length; i++) {
            switch (modsArr[i]) {
                case "Hidden": { abbMods.push("HD"); break }
                case "HardRock": { abbMods.push("HR"); break }
                case "DoubleTime": { abbMods.push("DT"); break }
                case "Nightcore": { abbMods.push("NC"); break }
                case "Flashlight": { abbMods.push("FL"); break }
                case "Easy": { abbMods.push("EZ"); break }
                case "HalfTime": { abbMods.push("HT"); break }
                case "NoFail": { abbMods.push("NF"); break }
                case "SpunOut": { abbMods.push("SO"); break }
                case "SuddenDeath": { abbMods.push("SD"); break }
                case "Perfect": { abbMods.push("PF"); break }
                case "Autopilot": { abbMods.push("AP"); break }
                case "TouchDevice": { abbMods.push("TD"); break }
                case "FadeIn": { abbMods.push("FI"); break }
                case "Random": { abbMods.push("RD"); break }
                case "Mirror": { abbMods.push("MR"); break }
                case "Key1": { abbMods.push("1K"); break }
                case "Key2": { abbMods.push("2K"); break }
                case "Key3": { abbMods.push("3K"); break }
                case "Key4": { abbMods.push("4K"); break }
                case "Key5": { abbMods.push("5K"); break }
                case "Key6": { abbMods.push("6K"); break }
                case "Key7": { abbMods.push("7K"); break }
                case "Key8": { abbMods.push("8K"); break }
                case "Key9": { abbMods.push("9K"); break }
                case "ScoreV2": { hasV2 = true; break }
                case "Relax": { hasRelax = true; break }
                // default: { abbMods.push(modsArr[i]); break; }
            }
        }
        // 有NC时去掉DT
        const indexDT = abbMods.indexOf("DT");
        const indexNC = abbMods.indexOf("NC");
        if (indexNC >= 0) abbMods.splice(indexDT, 1);
        // 有PF时去掉SD
        const indexSD = abbMods.indexOf("SD");
        const indexPF = abbMods.indexOf("PF");
        if (indexPF >= 0) abbMods.splice(indexSD, 1);
        let modsString = abbMods.join("");
        if (!modsString) modsString = "None";
        // V2放后面
        if (hasV2) modsString = modsString + ", ScoreV2";
        // relax放最后面
        if (hasRelax) modsString = modsString + ", Relax";
        return modsString;
    }
}
module.exports = utils;
