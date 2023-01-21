"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FortuneBinding_1 = __importDefault(require("./FortuneBinding"));
class Fortune {
    constructor(events) {
        this.events = events;
    }
    binding(who) {
        return new FortuneBinding_1.default(who, this);
    }
}
exports.default = Fortune;
