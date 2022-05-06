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
    const { transformMode, validateMode } = (0, tryMode_1.default)(options);
    ctx.model.extend('user', {
        osu: { type: 'json', initial: {} }
    });
    const cmd = ctx.command('osu');
    cmd.subcommand('.bind [username: text]')
        .option('server', '-s <server>')
        .option('mode', '-m <mode>')
        .userFields(['authority', 'osu'])
        .action((argv, user) => {
        let { session, options: { server, mode } } = argv;
        if (!session.user.osu)
            session.user.osu = {};
        // workaround
        const binded = { ...session.user.osu };
        // const binded = session.user.osu
        if (!server)
            return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n');
        // if (!mode && !binded?.[server]?.mode) return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`
        try {
            mode = validateMode(transformMode(mode), server);
            if (mode && !Object.values(options.server).some(server => server.mode.some(m => m === mode)))
                return `指定的模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`;
            if (!binded[server])
                binded[server] = {};
            if (mode)
                binded[server].mode = mode;
            if (user)
                binded[server].user = user;
            session.user.osu = { ...binded };
            return JSON.stringify(session.user.osu);
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
        .action(({ session }) => JSON.stringify(session.user.osu));
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
    });
}
exports.apply = apply;
