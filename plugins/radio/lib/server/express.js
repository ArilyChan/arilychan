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
const path_1 = require("path");
const express_1 = __importStar(require("express"));
const socket_io_1 = require("socket.io");
const nocache_1 = __importDefault(require("nocache"));
const app = (0, express_1.default)();
const router = (0, express_1.Router)();
const publicDir = (0, path_1.join)(__dirname, '../../public');
exports.default = (option, storage, http) => {
    router.get('/', (req, res, next) => {
        // res.sendFile(path.join(publicDir, 'index.html'))
        res.redirect(`${option.web.path}/player`);
    });
    router.use(['/manifest.json', '/service-worker.js', '/player'], (0, nocache_1.default)());
    router.get('/player', (req, res, next) => {
        res.sendFile((0, path_1.join)(publicDir, 'index.html'), {
            cacheControl: false
        });
    });
    router.get('/history', async (req, res, next) => {
        res.json(await storage.filteredPlaylistArray());
    });
    router.use((0, express_1.static)(publicDir));
    app.use(router);
    const { emitter } = storage;
    const io = new socket_io_1.Server(http, {
        path: '/Radio'
    });
    ['search-result', 'broadcast-message', 'remove-track']
        .map(eventName => emitter.on(eventName, (...args) => io.sockets.emit(eventName, ...args)));
    return app;
};
