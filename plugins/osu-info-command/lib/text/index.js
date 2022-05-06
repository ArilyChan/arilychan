"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = void 0;
const command_inject_options_1 = __importDefault(require("../command-inject-options"));
exports.name = 'osu-info-command-text';
function apply(ctx) {
    const oi = ctx.command('osu');
    const info = oi
        .subcommand('.info.text [username:text]')
        .action((argv, username) => {
        const { options } = argv;
        // @ts-expect-error registered later
        const { mode, server, from } = options;
        return JSON.stringify({ user: username, mode, server, from });
    });
    [info].forEach((command) => (0, command_inject_options_1.default)(command, ['mode', 'server']));
}
exports.apply = apply;
