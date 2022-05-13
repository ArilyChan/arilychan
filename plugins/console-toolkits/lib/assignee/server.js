"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.using = void 0;
require("@koishijs/plugin-console");
function groupByKey(array, key) {
    return array
        .reduce((hash, obj) => {
        if (obj[key] === undefined)
            return hash;
        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
    }, {});
}
exports.using = ['database'];
function default_1(ctx) {
    const searchPlatform = async (platform) => {
        const result = await ctx.database.get('channel', {
            platform: new RegExp(platform)
            // @ts-expect-error
        }, ['id', 'name', 'platform', 'assignee']);
        if (!result.length) {
            return [];
        }
        const grouped = groupByKey(result, 'platform');
        return Object.entries(grouped).map(([platform, result]) => ({
            type: 'platform',
            platform,
            selects: result
        }));
    };
    const searchAssignee = async (assignee) => {
        if (!assignee.length) {
            return [];
        }
        const result = await ctx.database.get('channel', {
            assignee: new RegExp(assignee)
            // @ts-expect-error
        }, ['id', 'assignee', 'name', 'platform']);
        if (!result.length) {
            return [];
        }
        const grouped = groupByKey(result, 'assignee');
        return Object.entries(grouped).map(([assignee, result]) => ({
            type: 'assignee',
            assignee,
            selects: result
        }));
    };
    const searchChannel = async (query) => {
        return [
            ...await searchPlatform(query),
            ...(await searchAssignee(query))
        ].filter(a => a);
    };
    const app = ctx;
    ctx.using(['router'], ({ router }) => {
        router.get('/toolkit/assignee/search/:kw', async (ctx) => {
            ctx.body = await searchChannel(ctx.params.kw);
        });
        router.post('/toolkit/assignee/clearOne', async (ctx) => {
            // console.log(ctx.request.body.channel)
            const body = ctx.request.body.data;
            const { platform, id } = body.channel;
            try {
                // await app.database.setChannel(platform, id, { $remove: 'assignee' })
                await app.database.set('channel', {
                    platform,
                    id
                }, {
                    assignee: null
                });
                ctx.body = {
                    message: 'removed'
                };
            }
            catch (error) {
                ctx.body = {
                    message: error.message
                };
                ctx.status = 500;
            }
        });
        router.post('/toolkit/assignee/changeOne', async (ctx) => {
            // console.log(ctx.request.body.channel)
            const body = ctx.request.body.data;
            const { platform, id } = body.channel;
            const { assignee } = body;
            try {
                await app.database.setChannel(platform, id, { assignee });
                ctx.body = {
                    message: 'updated'
                };
            }
            catch (error) {
                ctx.body = {
                    message: error.message
                };
                ctx.status = 500;
            }
        });
    });
    // ctx.using(['console'], () => {
    //   ctx.console.ws.broadcast()
    //   ctx.console.ws.addListener('toolkit/assignee/searchChannel', channel => {
    //     console.log(channel)
    //   })
    // })
}
exports.default = default_1;
