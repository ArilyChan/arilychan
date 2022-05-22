import path from 'path';
import fs from 'fs';
import { marked } from 'marked';
const _boundary = path.join(process.env.NODE_PATH || process.cwd(), 'node_modules');
export const sharedState = {};
export const sharedCache = new WeakMap();
export const name = 'manual-on-web';
export function apply(ctx) {
    console.log('running');
    sharedState.installed = true;
    sharedCache.set(ctx, ctx);
    sharedState.getCtx = () => {
        return sharedState.get(ctx);
    };
    ctx.router.get('/manual', _ctx => {
        _ctx.response.body = 'running';
    });
    ctx.router.get('/manual/plugin/:plugin', async (_ctx) => {
        // @ts-expect-error we got this
        const plugin = _ctx.request.params.plugin;
        const boundary = fs.realpathSync(path.resolve(_boundary, plugin));
        _ctx.response.body = 'plugin: ' + plugin + '\n';
        _ctx.response.body += 'boundary:' + boundary + '\n';
        let pluginPath = fs.realpathSync(require.resolve(plugin));
        _ctx.response.body += 'main file:' + pluginPath + '\n';
        let relative = path.relative(boundary, pluginPath);
        let inScope = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        let possibleReadme = path.resolve(pluginPath, './readme.md');
        let gotReadme = fs.existsSync(possibleReadme);
        _ctx.response.body += 'possible readme:' + possibleReadme + '\n';
        _ctx.response.body += 'gotReadme: ' + gotReadme + '\n';
        if (gotReadme) {
            _ctx.response.body += marked.parse(fs.readFileSync(possibleReadme, { encoding: 'utf8' }));
        }
        else {
            while (!gotReadme && inScope) {
                pluginPath = path.resolve(pluginPath, '..');
                relative = path.relative(boundary, pluginPath);
                inScope = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
                possibleReadme = path.resolve(pluginPath, './readme.md');
                _ctx.response.body += 'possible readme:' + possibleReadme + '\n';
                gotReadme = fs.existsSync(possibleReadme);
                _ctx.response.body += 'gotReadme: ' + gotReadme + '\n';
            }
            if (!gotReadme) {
                _ctx.response.body += 'not found.';
            }
            else {
                _ctx.response.body += marked.parse(fs.readFileSync(possibleReadme, { encoding: 'utf8' }));
            }
        }
    });
    ctx.router.get('/ssr', async (_ctx) => {
        const { req } = _ctx;
        let result;
        try {
            // result = await renderToStringAsync(() => <App url={req.url} />)
        }
        catch (err) {
            console.error(err);
        }
        finally {
            // res.send(result)
            _ctx.response.body = result;
        }
    });
}
//# sourceMappingURL=index.js.map