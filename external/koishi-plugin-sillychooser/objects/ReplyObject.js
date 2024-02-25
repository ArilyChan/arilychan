"use strict";


class ReplyObject {
    constructor(askObject) {
        this.reply = true;
        this.choices = [];
        this.askObject = askObject;
        // set the default action to randomly pick an response in the choices array.
        this.formatter = function () {
            if (this.choices.length > 0) return this.choices[Math.floor(Math.random() * this.choices.length)];
            return null;
        };
    }
    setChoices(choices) {
        this.choices = choices;
        this.flipPosition();
        this.choices = this.choices.map((str) => this.askObject.reputSpecialStrings(str));
        return this;
    }
    // set the custom formatting function
    format(formatter) {
        this.formatter = formatter;
        return this;
    }
    // get an string response as well as record them
    toString() {
        if (typeof this.formatter === "function") {
            // forceed to be String
            return this.formatter().toString();
        }
        return null;
    }
    // returns an ReplyObject that means to not reply.
    no() {
        const no = new ReplyObject(this.ask);
        no.reply = false;
        return no;
    }
    // 人称代词转换
    // 以后“是你吗” -> “不是我” 也用得到，现在暂时只回答“不是”
    flipPosition() {
        this.choices = this.choices.map((str) => str.split("").map((char) => ((char === "我") ? "你" : (char === "你" ? "我" : char))).join(""));
        return this;
    }
}



module.exports = ReplyObject;
