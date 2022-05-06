"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tryUser(options) {
    const defaultServer = Object.entries(options.server).find(([server, conf]) => conf.default)?.[0];
    return {
        tryUser(user, session, server = defaultServer) {
            return session.user?.osu?.[server]?.user || user;
        }
    };
}
exports.default = tryUser;
