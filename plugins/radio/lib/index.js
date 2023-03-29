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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const api_1 = __importDefault(require("./server/api"));
const express_1 = __importDefault(require("./server/express"));
const koishi_1 = require("koishi");
const Command = __importStar(require("./command"));
exports.name = 'arilychan-radio';
exports.schema = koishi_1.Schema.object({
    // duration: Schema.number().usage('')
    expire: koishi_1.Schema.number().description('点歌有效期限（天）').default(7),
    // db: Schema.object({
    //   uri: Schema.string().description('mongodb connect uri')
    // }).description('currently running on custom server'),
    web: koishi_1.Schema.object({
        path: koishi_1.Schema.string().description('网页地址，运行在express上。需要socket.io服务, 暂时不兼容koishi的http服务器').default('/radio'),
        host: koishi_1.Schema.string().description('domain?').default('https://bot.ri.mk')
    })
});
const apply = async (ctx, options) => {
    const storage = await (0, api_1.default)(ctx, options);
    ctx.using(['express'], function arilychanRadioWebService({ express, _expressHttpServer }) {
        express.use(options.web.path, (0, express_1.default)(options, storage, _expressHttpServer));
    });
    ctx.plugin(Command, options);
};
exports.apply = apply;
