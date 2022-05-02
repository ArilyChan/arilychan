"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const peggy_1 = __importDefault(require("peggy"));
exports.parser = peggy_1.default.generate(fs_1.default.readFileSync(path_1.default.join(__dirname, 'a.pegjs'), { encoding: 'utf8' }));
