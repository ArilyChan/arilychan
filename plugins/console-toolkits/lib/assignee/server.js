"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.using = void 0;
const koishi_1 = require("koishi");
require("@koishijs/plugin-console");
function groupBy(array, key) {
    return array
        .reduce((acc, cur) => {
        const curValue = cur[key];
        if (curValue === undefined) {
            return acc;
        }
        acc[curValue] || (acc[curValue] = []);
        acc[curValue].push(cur);
        return acc;
    }, {});
}
exports.using = ['database'];
function default_1(ctx) {
    async function searchPlatform(platform) {
        const result = await ctx.database.get('channel', {
            platform: new RegExp(platform)
        }, ['guildId', 'platform', 'assignee']);
        if (!result.length) {
            return [];
        }
        const grouped = groupBy(result, 'platform');
        return await Promise.all(Object.entries(grouped).map(async ([platform, result]) => ({
            type: 'platform',
            platform,
            selects: await Promise.all(result.map(async (r) => {
                return ({
                    ...r,
                    id: r.guildId,
                    guildId: undefined,
                    name: await nameOfChannelOrGuild(r.guildId, r)
                });
            }))
        })));
    }
    async function searchAssignee(assignee) {
        if (!assignee.length) {
            return [];
        }
        const result = await ctx.database.get('channel', {
            assignee: new RegExp(assignee)
        }, ['guildId', 'assignee', 'platform']);
        if (!result.length) {
            return [];
        }
        const grouped = groupBy(result, 'assignee');
        return await Promise.all(Object.entries(grouped).map(async ([assignee, result]) => ({
            type: 'assignee',
            assignee,
            selects: await Promise.all(result.map(async (r) => {
                return ({
                    ...r,
                    id: r.guildId,
                    guildId: undefined,
                    name: await nameOfChannelOrGuild(r.guildId, r)
                });
            }))
        })));
    }
    async function searchChannel(query) {
        const result = [
            ...await searchPlatform(query),
            ...await searchAssignee(query)
        ];
        return result.filter(a => a);
    }
    const app = ctx;
    ctx.using(['router'], ({ router }) => {
        router.get('/toolkit/assignee/search/:kw', async (ctx) => {
            ctx.body = await searchChannel(ctx.params.kw);
        });
        router.post('/toolkit/assignee/clear', async (ctx) => {
            const body = ctx.request.body;
            try {
                await app.database.set('channel', body.query, { assignee: null });
                removed(ctx);
            }
            catch (error) {
                serverSideError(ctx, error.message);
            }
        });
        router.post('/toolkit/assignee/change', async (ctx) => {
            const body = ctx.request.body;
            const { assignee } = body;
            try {
                await app.database.set('channel', body.query, { assignee });
                done(ctx);
            }
            catch (error) {
                serverSideError(ctx, error.message);
            }
        });
    });
    async function nameOfChannelOrGuild(channelOrGuildId, supplementaryQueries) {
        const bots = ctx.bots.filter(b => supplementaryQueries ? supplementaryQueries.assignee === b.selfId || supplementaryQueries.platform === b.platform : true);
        for (const bot of bots) {
            const result = await bot.getChannel(channelOrGuildId).then(c => c.channelName).catch(koishi_1.noop) || await bot.getGuild(channelOrGuildId).then(g => g.guildName).catch(koishi_1.noop);
            if (result)
                return result;
        }
        return '?';
    }
}
exports.default = default_1;
function serverSideError(ctx, message, status = 500) {
    ctx.body = { message };
    ctx.status = status;
    return ctx;
}
function done(ctx) {
    ctx.body = {
        message: 'done'
    };
}
function removed(ctx) {
    ctx.body = {
        message: 'removed'
    };
}
