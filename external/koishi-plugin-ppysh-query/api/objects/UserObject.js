const utils = require('../utils');
const ModeStatsObject = require("./ModeStatsObject");

class UserObject {
    constructor(user, mode) {
        if (user) {
            this.userId = user.user_id;
            this.username = user.username;
            this.mode = parseInt(mode);
            this.modeStats = new ModeStatsObject(user);

            this.recordDate = new Date();
        }
    }

    init(userObjectJson, mode) {
        let thisUserObject = JSON.parse(userObjectJson);
        this.userId = thisUserObject.userId;
        this.username = thisUserObject.username;
        this.mode = parseInt(mode);
        this.modeStats = new ModeStatsObject().init(thisUserObject.modeStats);

        this.recordDate = new Date(thisUserObject.recordDate);
        return this;
    }

    /**
     * @param {UserObject} oldUserObject 
     * @param {String|Number} mode 
     */
    tocompareString(oldUserObject, mode) {
        if (!oldUserObject) oldUserObject = this;
        let output = "";
        output = output + this.username + " 的 " + utils.getModeString(mode) + " 详细信息：\n";
        output = output + "id：" + this.userId + "\n";
        output = output + this.modeStats.compareTo(oldUserObject.modeStats);
        output = output + "\n";
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