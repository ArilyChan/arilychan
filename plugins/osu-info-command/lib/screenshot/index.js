"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = exports.using = void 0;
const koishi_1 = require("koishi");
const command_inject_options_1 = __importDefault(require("../command-inject-options"));
const tryMode_1 = __importDefault(require("../utils/tryMode"));
const tryUser_1 = __importDefault(require("../utils/tryUser"));
exports.using = ['puppeteerCluster'];
exports.name = 'osu-info-command-screenshot';
function apply(app, options) {
    // const logger = app.logger('osu-screenshot')
    const { transformModeOP, validateOP } = (0, tryMode_1.default)(options);
    const { tryUser } = (0, tryUser_1.default)(options);
    // @ts-expect-error we got this
    const cluster = app.puppeteerCluster;
    cluster.options.screenshot.type = 'jpeg';
    const screenshot = async (url) => {
        const screen = await cluster.screenshot.base64(url);
        return (0, koishi_1.segment)('image', {
            url: `base64://${screen}`
        });
    };
    const params = (params) => {
        return `?${new URLSearchParams(params)}`;
    };
    const ops = {
        stat(op) {
            try {
                op = validateOP(transformModeOP(op), op.session);
                let { user: username, mode, server, session } = op;
                username = tryUser(username, session, server);
                if (!username) {
                    if (session.user.authority > 2)
                        return JSON.stringify({ username, bound: { osu: { ...session.user.osu } } });
                    return '需要提供用户名。';
                }
                app.logger('osu-info-command').info('stat:', { username, mode, server });
                const ep = `${options.screenshot.base}/users/${username}${(mode && `/${mode}`) || ''}${params({ server })}`;
                return screenshot(ep);
            }
            catch (error) {
                return error.message;
            }
        },
        best(op) {
            try {
                op = validateOP(transformModeOP(op), op.session);
                let { user: username, mode, server, session, find } = op;
                username = tryUser(username, session, server);
                find = {
                    startDate: find.from,
                    endDate: find.to,
                    startHoursBefore: find.last,
                    endHoursBefore: undefined
                };
                if (!username)
                    return '需要提供用户名。';
                return screenshot(`${options.screenshot.base}/best/${username}${(mode && `/${mode}`) || ''}${params({ server, ...find })}`);
            }
            catch (err) {
                return err.message;
            }
        },
        'recent-score'(op) {
            try {
                op = validateOP(transformModeOP(op), op.session);
                let { user: username, mode, server, session } = op;
                username = tryUser(username, session, server);
                if (!username)
                    return '需要提供用户名。';
                return screenshot(`${options.screenshot.base}/recent/${username}${(mode && `/${mode}`) || ''}${params({ server })}`);
            }
            catch (err) {
                return err.message;
            }
        },
        userpage(op) {
            try {
                op = validateOP(transformModeOP(op), op.session);
                let { user: username, server, session } = op;
                username = tryUser(username, session, server);
                if (!username)
                    return '需要提供用户名。';
                return screenshot(`${options.screenshot.base}/userpage/${username}${params({ server })}`);
            }
            catch (e) {
                return e.message;
            }
        },
        score(op) {
            try {
                op = validateOP(transformModeOP(op), op.session);
                const { mode, id, server } = op;
                return screenshot(`${options.screenshot.base}/scores/${mode}/${id}${params({ server })}`);
            }
            catch (e) {
                return e.message;
            }
        },
        help() { return '使用方法请通过`!help screenshot`查询。'; }
    };
    const oi = app.command('osu');
    const defaultWithServerCommands = [
        oi
            .subcommand('.userpage.screenshot <username:text>')
            .action((argv, username) => {
            const { options, session } = argv;
            // @ts-expect-error registered later
            const { server } = options;
            return ops.userpage({ user: username, server, session });
        })
    ];
    const defaultWithServerModeCommands = [
        oi
            .subcommand('.info.screenshot <username:text>')
            .userFields(['authority', 'osu'])
            .action((argv, username) => {
            const { options, session } = argv;
            // @ts-expect-error registered later
            const { mode, server } = options;
            return ops.stat({ user: username, mode, server, session });
        }),
        oi
            .subcommand('.recent.screenshot <username:text>')
            .userFields(['authority', 'osu'])
            .action((argv, username) => {
            const { options, session } = argv;
            // @ts-expect-error registered later
            const { mode, server } = options;
            return ops['recent-score']({ user: username, mode, server, session });
        }),
        oi
            .subcommand('.best.screenshot <username:text>')
            .userFields(['authority', 'osu'])
            .option('from', '<date>')
            .option('to', '<date>')
            .option('last', '<hours>')
            .action((argv, username) => {
            const { options, session } = argv;
            // @ts-expect-error registered later
            const { mode, server, from, to, last } = options;
            return ops.best({ user: username, mode, server, session, find: { from, to, last } });
        }),
        oi
            .subcommand('.score.screenshot <id:number>')
            .userFields(['authority', 'osu'])
            .action((argv, id) => {
            const { options, session } = argv;
            // @ts-expect-error registered later
            const { mode, server } = options;
            return ops.score({ id, mode, server, session });
        })
    ];
    defaultWithServerCommands.forEach((command) => (0, command_inject_options_1.default)(command, ['server']));
    defaultWithServerModeCommands.forEach((command) => (0, command_inject_options_1.default)(command, ['mode', 'server']));
}
exports.apply = apply;
