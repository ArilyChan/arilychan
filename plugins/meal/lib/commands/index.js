"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const declares_1 = require("../declares");
const koishi_1 = require("koishi");
const useRandomMeal_1 = __importDefault(require("../composable/useRandomMeal"));
const useRandomCourse_1 = __importDefault(require("../composable/useRandomCourse"));
const useStringify_1 = __importDefault(require("../composable/useStringify"));
const interface_1 = __importDefault(require("../web/interface"));
exports.name = 'meal-commands';
exports.schema = koishi_1.Schema.object({});
function apply(ctx, options) {
    const stringify = (0, useStringify_1.default)(ctx, options)('element');
    if (!stringify)
        return;
    const randomCourse = (0, useRandomCourse_1.default)(ctx, options);
    const randomMeal = (0, useRandomMeal_1.default)(ctx, options);
    const c = ctx.command('meal', '点餐');
    c.subcommand('menu', '查看菜单')
        .action(() => {
        return interface_1.default.menu;
    });
    c.subcommand('random [...disabledFlags]', '随机菜单')
        .alias('吃什么', '吃什麼', '吃啥')
        .option('course', '-c')
        // .option('section', '--section [section]')
        .action(async ({ options }, ...disabledFlags) => {
        const { course } = options || { course: false };
        const existedFlags = disabledFlags.filter(mark => declares_1.flags.includes(mark));
        if (course) {
            const c = await randomCourse(existedFlags.length ? existedFlags : undefined);
            return stringify.course(c);
        }
        else {
            const m = await randomMeal(existedFlags.length ? existedFlags : undefined);
            return stringify.meal(m);
        }
    });
    c.subcommand('add <message:text>');
}
exports.apply = apply;
