class Command {
    constructor(message) {
        this.message = message;
        this.type = "";
        this.args = [];
    }
    /**
     * 拆出指令和参数
     * @param {RegExp} commandReg
     * @returns {Boolean} 消息是否符合指令形式
     */
    cutCommand() {
        const mr = /^([a-zA-Z]+)/i.exec(this.message);
        if (mr === null) return false;

        this.commandString = mr[1].toLowerCase();
        this.argString = this.message.substring(this.commandString.length).trim();
        return true;

    }
    /**
     * 分析argString
     */
    getArgObject() {
        const arr = this.argString.split(/,|，|‚/);
        const args = [];
        // eslint-disable-next-line array-callback-return
        arr.map((s) => {
            if (s) args.push(s.trim().toLocaleLowerCase());
        });
        this.type = args[0];
        this.args = args.slice(1); // 不足则为[]
    }
    async apply(stat, host, apiKey, saveDir, downloader, commandsInfo) {
        try {
            if (!this.cutCommand()) return "";
            if (this.commandString !== "exbp") return "";
            this.getArgObject();
            if (!this.type || !this.args) return commandsInfo.getHelp();
            // 查找指令
            const commands = commandsInfo.commands;
            for (const com of commands) {
                if (com.command.includes(this.type)) {
                    // if (com.adminCommand && !this.checkAdmin()) return "该指令需要管理员权限";
                    if (stat.isbusy) return "请再等等QAQ";
                    stat.isbusy = true;
                    const output = await com.call(host, apiKey, saveDir, downloader, this.args);
                    stat.isbusy = false;
                    return output;
                }
            }
            return "找不到该指令\n" + commandsInfo.getHelp();
        }
        catch (ex) {
            return ex;
        }
    }
}
module.exports = Command;
