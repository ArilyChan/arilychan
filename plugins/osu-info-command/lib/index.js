"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = exports.schema = void 0;
const koishi_1 = require("koishi");
const database = __importStar(require("./database"));
const screenshot = __importStar(require("./screenshot"));
const text = __importStar(require("./text"));
const serverConfig = koishi_1.Schema.object({
    default: koishi_1.Schema.boolean().default(false).description('默认查询此服务器'),
    // trigger: Schema.array(String).description('触发').default([]),
    server: koishi_1.Schema.string(),
    mode: koishi_1.Schema.array(String).default(['osu', 'taiko', 'fruit', 'mania'])
});
exports.schema = koishi_1.Schema.object({
    screenshot: koishi_1.Schema.object({
        base: koishi_1.Schema.string().default('https://info.osustuff.ri.mk/cn').description('osu-info-web网站根目录(/{lang})')
    }),
    server: koishi_1.Schema.dict(serverConfig)
        .description('配置可用的服务器')
        .default({
        bancho: {
            default: true,
            // trigger: ['!!', '?'],
            server: 'osu! 官方服务器',
            mode: ['osu', 'taiko', 'fruit', 'mania']
        },
        sb: {
            default: false,
            // trigger: ['*'],
            server: 'ppy.sb私服',
            mode: ['osu', 'osuRX', 'osuAP', 'taiko', 'taikoRX', 'fruit', 'fruitRX', 'mania']
        }
    }),
    modeAlias: koishi_1.Schema.dict(koishi_1.Schema.array(String))
        .description('mode的别名')
        .default({
        osu: ['std'],
        osuRX: ['rx', 'stdrx', 'osurx', 'relax', 'osurelax'],
        osuAP: ['ap', 'stdap', 'osuap', 'ap', 'osuautopilot'],
        taiko: ['太鼓', 'Taiko'],
        taikoRX: ['taikorx'],
        fruit: ['ctb', '接水果'],
        mania: ['骂娘', 'keys', 'key']
    })
});
exports.name = 'osu-info-command';
function apply(ctx, options) {
    console.log(options);
    ctx.plugin(database, options);
    // @ts-expect-error we got this, it's fine
    ctx.plugin(screenshot, options);
    ctx.plugin(text, options);
}
exports.apply = apply;
/*

数据库：
user.osu = {
  bancho: {
    mode: osu
  },
  sb: {
    mode: osuRX
  }
}
默认配置：看最上面
{
  screenshot: { base: 'https://info.osustuff.ri.mk/cn' },
  server: {
    bancho: { default: true, server: 'osu! 官方服务器', mode: [Array] },
    sb: { default: false, server: 'ppy.sb私服', mode: [Array] }
  },
  modeAlias: {
    osu: [ 'std' ],
    osuRX: [ 'rx', 'stdrx', 'osurx', 'relax', 'osurelax' ],
    osuAP: [ 'ap', 'stdap', 'osuap', 'ap', 'osuautopilot' ],
    taiko: [ '太鼓', 'Taiko' ],
    taikoRX: [ 'taikorx' ],
    fruit: [ 'ctb', '接水果' ],
    mania: [ '骂娘', 'keys', 'key' ]
  }
}
*/
