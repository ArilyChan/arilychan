"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = void 0;
// import injectOsuOptions from '../command-inject-options'
const tryMode_1 = __importDefault(require("../utils/tryMode"));
exports.name = 'osu-info-command-extend-database';
function apply(ctx, options) {
    const replyBindedStatus = (osu, omit = [], only = undefined) => {
        const rep = [];
        const servers = Object.keys(options.server);
        servers.forEach(server => {
            if (!only) {
                if (omit.includes(server))
                    return;
            }
            else {
                if (!only.includes(server))
                    return;
            }
            if (!osu[server])
                return;
            const serverBind = osu[server];
            const serverConf = options.server[server];
            rep.push([`${serverConf.server}: `, serverBind.mode && `mode: ${serverBind.mode} `, serverBind.user && `user: ${serverBind.user}`].join(''));
        });
        if (osu.defaultServer && !omit.includes('defaultServer')) {
            rep.push(`默认服务器: ${osu.defaultServer}`);
        }
        return rep.join('\n');
    };
    const { transformMode, validateMode } = (0, tryMode_1.default)(options);
    ctx.model.extend('user', {
        osu: { type: 'json', initial: {} }
    });
    const cmd = ctx.command('osu');
    cmd.subcommand('.bind <username: text>')
        .option('server', '-s [server]')
        .option('mode', '-m [mode]')
        .userFields(['osu', 'osu2', 'authority'])
        .action(async (argv, user) => {
        const { session } = argv;
        let { options: { server, mode } } = argv;
        if (!server)
            return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n');
        // if (!mode && !binded?.[server]?.mode) return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`
        try {
            mode = validateMode(transformMode(mode), server);
            console.log({ mode, user, server });
            if (mode && !Object.values(options.server).some(server => server.mode.some(m => m === mode)))
                return `指定的模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`;
            if (!session.user.osu[server])
                session.user.osu[server] = {};
            if (mode)
                session.user.osu[server].mode = mode;
            if (user)
                session.user.osu[server].user = user;
            return replyBindedStatus(session.user.osu, [], [server]);
        }
        catch (error) {
            if (session.user.authority > 2) {
                return error.stack;
            }
            return error.message;
        }
    });
    cmd.subcommand('.binded')
        .userFields(['authority', 'osu'])
        .action(({ session }) => replyBindedStatus(session.user.osu));
    cmd.subcommand('.unbind')
        .option('server', '-s <server>')
        .userFields(['authority', 'osu'])
        .action((argv) => {
        const { session, options } = argv;
        const { server } = options;
        if (session.user.osu[server]) {
            session.user.osu[server] = {};
            if (session.user.osu.defaultServer === server) {
                session.user.osu.defaultServer = undefined;
            }
        }
        return '👌 ok!';
    });
    cmd.subcommand('bindserver <server>')
        .userFields(['authority', 'osu'])
        .action(({ session }, server) => {
        if (!server)
            return '请指定服务器。\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n');
        server = server.trim();
        // @ts-expect-error optional chained
        if (!session.user.osu?.[server]?.name)
            return '您还未绑定该服务器的用户。请先绑定！';
        session.user.osu.defaultServer = server;
        return '👌 ok!';
    });
}
exports.apply = apply;
