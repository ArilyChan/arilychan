"use strict";

var glob = require('glob'),
    path = require('path');

class CommandsInfo {
    /**
     * @param {Array<String>} prefixs 指令前缀，必须为单个字符，默认为[?,？]
     */
    constructor(prefixs) {
        this.prefixs = prefixs;
        this.commandReg = /^([a-zA-Z]+)/i; // 去除prefix后截取指令部分
        this.regs = {
            beatmapStringWithUser: /^([^|｜]+)/i, // 后面有user时取beatmap
            beatmapStringWithoutUser: /^([^+＋:：#＃]+)/i, // 后面没有user时取beatmap
            userStringWithBeatmap: /[|｜]([^+＋:：#＃|｜]+)/i, // 前面有beatmap时取user
            userStringWithoutBeatmap: /^([^+＋:：#＃|｜]+)/i, // 前面没有beatmap时取user
            // modsString: /[+＋]([a-zA-Z0-9]+)/i,
            modeString: /[:：]([^+＋:：#＃|｜/／“”'"]+)/i,
            onlyModeString: /^([^+＋:：#＃|｜/／“”'"]+)/i, // 参数只有mode，设置mode用
            limitString: /[#＃]([0-9]+)/i
        };
        this.commands = this.loadModules();
    }

    // 加载modules内的enabled指令
    loadModules() {
        let commands = [];
        let allcommand = [];
        glob.sync(path.join(__dirname, '../modules/*.js')).map((file) => {
            try {
                let module = require(path.resolve(file));
                if (module !== undefined && module.enabled) {
                    commands.push(module);
                    allcommand.push(...module.command);
                    console.log("[ppysb]加载指令：" + module.type);
                }
                if (new Set(allcommand).size !== allcommand.length) {
                    console.log("[ppysb]警告：检测到重复指令，位于" + module.type);
                }
            } catch (e) {
                console.log('[ppysb]unable to load module due to require error', path.resolve(file));
            }
        });
        return commands;
    }

}


module.exports = CommandsInfo;