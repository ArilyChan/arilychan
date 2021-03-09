const utils = require('../utils');
const ModeStatsObject = require("./ModeStatsObject");

class UserObject {
    constructor(user) {
        if (user) {
            this.userId = user.id;
            this.username = user.username;
            this.username_aka = user.username_aka;
            this.modeStats = [];
            this.modeStats[0] = new ModeStatsObject(user.std);
            this.modeStats[1] = new ModeStatsObject(user.taiko);
            this.modeStats[2] = new ModeStatsObject(user.ctb);
            this.modeStats[3] = new ModeStatsObject(user.mania);
            this.favourite_mode = user.favourite_mode;

            this.recordDate = new Date();
        }
    }

    init(userObjectJson) {
        let thisUserObject = JSON.parse(userObjectJson);
        this.userId = thisUserObject.userId;
        this.username = thisUserObject.username;
        this.username_aka = thisUserObject.username_aka;
        this.modeStats = [];
        this.modeStats[0] = new ModeStatsObject().init(thisUserObject.modeStats[0]);
        this.modeStats[1] = new ModeStatsObject().init(thisUserObject.modeStats[1]);
        this.modeStats[2] = new ModeStatsObject().init(thisUserObject.modeStats[2]);
        this.modeStats[3] = new ModeStatsObject().init(thisUserObject.modeStats[3]);
        this.favourite_mode = thisUserObject.favourite_mode;

        this.recordDate = new Date(thisUserObject.recordDate);
        return this;
    }

    /**
     * @param {UserObject} oldUserObject 
     * @param {String|Number} mode 
     * @param {Boolean} isRx
     */
    tocompareString(oldUserObject, mode = this.favourite_mode, isRx) {
        if (!oldUserObject) oldUserObject = this;
        let output = "";
        output = output + this.username + " 的 " + utils.getModeString(mode) + " 详细信息：\n";
        if (isRx) output = output + "模式：Relax\n";
        else output = output + "模式：Classic\n";
        output = output + "id：" + this.userId + "\n";
        output = output + this.modeStats[parseInt(mode)].compareTo(oldUserObject.modeStats[parseInt(mode)]);
        output = output + "\n";
        //output = output + "对比：" + oldUserObject.recordDate.toLocaleString();
        output = output + "对比：" + utils.getCompareInterval(oldUserObject.recordDate, this.recordDate);
        return output;
    }

    toJson() {
        return JSON.stringify(this);
    }

    getDateString() {
        return this.recordDate.toDateString();
    }
}


module.exports = UserObject;