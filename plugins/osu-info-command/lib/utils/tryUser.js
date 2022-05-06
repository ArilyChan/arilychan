"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unescape_1 = require("./unescape");
function tryUser(options) {
    const defaultServer = Object.entries(options.server).find(([server, conf]) => conf.default)?.[0];
    return {
        tryUser(user, session, server = defaultServer) {
            return (user && (0, unescape_1.unescapeOnebotSpecialChars)(user)) || session.user?.osu?.[server]?.user;
        }
    };
}
exports.default = tryUser;
