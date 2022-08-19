"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const a = (0, index_1.schema) `
@description('基础配置')
{
  shared: string,
  type: @required 'foo' | 'bar',
} & 
@description('特殊配置1')
union([
  {
    @required
    type: 'foo',

    @default(114514)
    value: number
  },
  {
    @required
    type: 'bar',

    @default(114514)
    text: string
  },
])
`;
console.log(a);
