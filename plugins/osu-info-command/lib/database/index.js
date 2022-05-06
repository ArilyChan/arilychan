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
    const { transformMode } = (0, tryMode_1.default)(options);
    ctx.model.extend('user', {
        osu: { type: 'json', initial: {} }
    });
    const cmd = ctx.command('osu');
    cmd.subcommand('.bind [username: text]')
        .option('server', '-s <server>')
        .option('mode', '-m <mode>')
        .action((argv, user) => {
        let { session, options: { server, mode } } = argv;
        // @ts-expect-error extended before (line 14)
        const binded = session.user.osu;
        if (!server)
            return '请指定服务器: osu.bind --server <server>\n' + Object.entries(options.server).map(([server, conf]) => `${conf.server}: ${server}`).join('\n');
        if (!mode && !binded[server]?.mode)
            return '请指定模式: osu.bind --mode <mode>\n' + `${options.server[server].server}: ${options.server[server].mode.join(', ')}`;
        mode = transformMode(mode);
        if (!Object.values(options.server).some(server => server.mode.some(m => m === mode)))
            return `模式不存在。 ${options.server[server].server}可用: ${options.server[server].mode.join(', ')}`;
        if (!binded[server])
            binded[server] = {};
        if (mode)
            binded[server].mode = mode;
        if (user)
            binded[server].user = user;
        // @ts-expect-error refer to koishi doc
        return JSON.stringify(session.user.osu);
    });
    cmd.subcommand('.binded')
        // @ts-expect-error refer to koishi doc
        .action(({ session }) => JSON.stringify(session.user.osu));
}
exports.apply = apply;
