'use strict';
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
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
const run = __importStar(require("./run"));
const path_1 = __importDefault(require("path"));
const EventsJson_1 = __importDefault(require("./bin/EventsJson"));
const export_1 = __importDefault(require("./osu-calendar-web-next/export"));
const thisPath = __dirname;
exports.name = 'koishi-plugin-osu-calendar';
exports.schema = export_1.default.schema = koishi_1.Schema.object({
    web: koishi_1.Schema.object({
        path: koishi_1.Schema.string().default('http://localhost:3005/fortune').description('screenshot path')
    }),
    auth: koishi_1.Schema.object({
        database: koishi_1.Schema.boolean().default(true).description('database auth'),
        databaseAuthority: koishi_1.Schema.number().default(3).description('minium authority to manage fortune.'),
        local: koishi_1.Schema.object({
            admin: koishi_1.Schema.array(String).default([]),
            blackList: koishi_1.Schema.array(String).default([]),
            whiteList: koishi_1.Schema.array(String).default([])
        })
    })
});
function apply(ctx, options) {
    const users = options.auth.local; // TODO deprecate this
    const eventPath = options.eventFile || path_1.default.join(thisPath, './osu-calendar-events.json');
    const eventsJson = new EventsJson_1.default();
    const logger = ctx.logger('osu-calendar');
    export_1.default.build();
    // ctx.using(['ci'], function osuCalendarCIRegister (ctx) { ctx.once('ci/build/register', () => ctx.ci.build.use(nextJSWeb.build)) })
    ctx.using(['express'], function osuCalendarWebApp(ctx) {
        ctx.once('ready', async () => {
            try {
                ctx.express.use(options.basePath || '/fortune', await export_1.default.webApp(options));
            }
            catch (_) {
                logger.warn('You need to build. run `npm run build` in osu-calendar-web');
                ctx.using(['ci'], async function osuCalendarAutoBuilder({ ci: { build } }) {
                    logger.info('You have ci plugin installed. trying auto-build...');
                    await build.run({ only: [exports.name] });
                    logger.info('Build finished, retry web service...');
                    ctx.express.use(options.basePath || '/fortune', await export_1.default.webApp(options));
                    logger.success('... Succeed! You are all set!');
                });
            }
        });
    });
    const command = ctx.command('fortune');
    command
        .subcommand('.today', 'today fortune')
        .alias('.daily')
        .alias('今日运势')
        .action(async (argv) => {
        const meta = argv.session;
        if (!ctx.puppeteerCluster) {
            logger.error('got no cluster');
            return await run.koishiHandler(meta, eventPath);
        }
        logger.error('got cluster');
        const cluster = ctx.puppeteerCluster.instance;
        cluster.queue(async ({ page }) => {
            try {
                await page.goto(`${options.web.path}/daily?seed=${meta.userId}&lang=zh-cn&displayName=${meta.author?.nickname || meta.author?.username || '你'}`);
                await page.setViewport({ width: 992, height: 100, deviceScaleFactor: 1.5 });
                const e = await page.$('#__next > div > div > div');
                const cqCode = koishi_1.segment.image(await e.screenshot({ type: 'jpeg' }));
                meta.send(cqCode).catch(_ => meta.send('发送图片失败。'));
            }
            catch (error) {
                logger.error(error);
                await run.koishiHandler(meta, eventPath);
            }
        });
    });
    const activity = command.subcommand('.activity');
    activity
        .subcommand('.add <name> <goodluck> <badluck>', 'add new activity to pool')
        .alias('添加活动')
        .example('添加活动 吃饭 吃的很饱 好难吃！')
        .action(async (argv, name, goodLuck, badLuck) => {
        const meta = argv.session;
        return await eventsJson.runAdd(meta, eventPath, users, name, goodLuck, badLuck, ctx);
    });
    activity
        .subcommand('.remove <name> <goodluck> <badluck>', 'add new activity to pool')
        .alias('删除活动')
        .example('删除活动 吃饭')
        .action(async (argv, name) => {
        const meta = argv.session;
        return await eventsJson.runDel(meta, eventPath, users, name);
    });
    activity
        .subcommand('.approve <name>', 'add new activity to pool')
        .alias('.confirm')
        .alias('.accept')
        .alias('确认活动')
        .example('确认活动 吃饭')
        .action(async (argv, name) => {
        const meta = argv.session;
        return await eventsJson.confirmPendingEvent(meta, eventPath, users, name);
    });
    activity
        .subcommand('.reject <name>', 'remove activity from pool')
        .alias('取消活动')
        .example('取消活动 吃饭')
        .action(async (argv, name) => {
        const meta = argv.session;
        return await eventsJson.refusePendingEvent(meta, eventPath, users, name);
    });
    activity
        .subcommand('.info <name>', 'show activity')
        .alias('查看活动')
        .example('查看活动 吃饭')
        .action(async (argv, name) => {
        const meta = argv.session;
        return await eventsJson.showEvent(meta, eventPath, name);
    });
    activity
        .subcommand('.pending', 'show pending activity')
        .alias('待审核活动')
        .action(async (argv) => {
        const meta = argv.session;
        return await eventsJson.showPendingEvent(meta, eventPath);
    });
}
exports.apply = apply;
