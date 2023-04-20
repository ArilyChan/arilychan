"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSender = void 0;
const base_1 = require("../base");
class BaseSender extends base_1.BaseIO {
    constructor() {
        super(...arguments);
        this.readyState = false;
    }
}
exports.BaseSender = BaseSender;
