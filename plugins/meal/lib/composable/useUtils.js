"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = void 0;
const random = (items) => items[Math.floor(Math.random() * items.length)];
exports.random = random;
