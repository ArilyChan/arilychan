"use strict";

class SimpleUserObject {
    constructor(user) {
        this.userId = user.id;
        this.username = user.username;
        this.username_aka = user.username_aka;
        this.registered_on = user.registered_on;
        this.privileges = user.privileges;
        this.latest_activity = user.latest_activity;
        this.country = user.country;
    }
}

module.exports = SimpleUserObject;