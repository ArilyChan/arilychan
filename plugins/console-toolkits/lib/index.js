"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.name = void 0;
require("@koishijs/plugin-console");
const path_1 = require("path");
exports.name = 'console-toolkits';
function apply(ctx) {
    // 在已有插件逻辑的基础上，添加下面这段
    ctx.using(['console'], (ctx) => {
        ctx.console.addEntry({
            dev: (0, path_1.resolve)(__dirname, '../client/index.ts'),
            prod: (0, path_1.resolve)(__dirname, '../dist')
        });
    });
    ctx.plugin((0, path_1.resolve)(__dirname, './assignee/server'));
}
exports.apply = apply;
