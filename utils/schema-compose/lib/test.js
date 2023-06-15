"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const config = (0, _1.schema) `{
  @required
  a: true,
  @default(1)
  b: number
} | {
  @required
  a: false,
  @default(2)
  b: number
}`;
console.log(config({ a: false }));
