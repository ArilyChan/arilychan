"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = exports.commandBuilder = void 0;
const koishi_1 = require("koishi");
const grammar_1 = require("./grammar");
const builder_1 = require("./runtime/builder");
function commandBuilder(logger) {
    const matches = [];
    return [
        matches,
        (command, index) => {
            if (Array.isArray(command))
                return;
            if (command.type !== 'incomingMessage')
                return;
            let matchRule;
            const cond = command.cond;
            switch (cond.type) {
                case 'startsWith':
                    matchRule = (session) => session.content.startsWith(cond.content);
                    break;
                case 'includes':
                    matchRule = (session) => session.content.includes(cond.content);
                    break;
                case 'equals':
                    if (cond.eq === 'strictEqual')
                        matchRule = (session) => session.content === cond.content;
                    // eslint-disable-next-line eqeqeq
                    if (cond.eq === 'equal')
                        matchRule = (session) => session.content == cond.content;
                    if (cond.eq === 'eq') {
                        logger('responder2').warn(`got 'assignment operator' in rules #${index}, auto-corret to double equal.`);
                        // eslint-disable-next-line eqeqeq
                        matchRule = (content) => content == cond.content;
                    }
                    break;
                case 'exec':
                    if (!cond.names)
                        cond.names = {};
                    matchRule = (0, builder_1.build)(cond.code, cond.names, { async: cond.async, inline: cond.inline, isMatcher: true });
            }
            const action = command.action;
            let run;
            switch (action.type) {
                case 'Literal':
                    run = () => action.value;
                    break;
                case 'exec':
                    if (!action.names)
                        action.names = {};
                    run = (0, builder_1.build)(action.code, action.names, { async: action.async, inline: action.inline, isAction: true });
            }
            matches.push([matchRule, run]);
        }
    ];
}
exports.commandBuilder = commandBuilder;
exports.name = 'yet-another-responder';
exports.schema = koishi_1.Schema.object({
    rules: koishi_1.Schema.array(String).description('match rules.').default(['// add more down below', '// don\'t leave rules empty'])
});
function apply(ctx, options) {
    const trigger = options.rules.join('\n');
    try {
        const [matches, builder] = commandBuilder(ctx.logger('resp2/builder'));
        const reader = grammar_1.parser.parse(trigger);
        reader.forEach(builder);
        ctx.middleware(async (session, next) => {
            const escapedSession = new Proxy(session, {
                get(target, key, receiver) {
                    if (key === 'content') {
                        return koishi_1.segment.unescape(target.content);
                    }
                    else {
                        return target[key];
                    }
                }
            });
            for (const [match, run] of matches) {
                let receivedMatcherResolvedValue = false;
                let matcherResolvedValue;
                const returnedValue = match(escapedSession, ctx, (result) => {
                    matcherResolvedValue = result;
                    receivedMatcherResolvedValue = true;
                }, () => {
                    matcherResolvedValue = false;
                    receivedMatcherResolvedValue = true;
                });
                if (receivedMatcherResolvedValue) {
                    if (!matcherResolvedValue) {
                        continue;
                    }
                }
                else if (!returnedValue) {
                    continue;
                }
                const rtn = await run(escapedSession, ctx, matcherResolvedValue ?? returnedValue);
                if (!rtn)
                    return;
                return rtn.toString();
            }
            return await next();
        });
        const resp2 = ctx.command('responder2').alias('resp2').usage('可以在配置里写函数的应答器');
        resp2.subcommand('.test <reallyLongString:text>')
            .usage('测试responder2语法是否合法')
            .example('resp2.test $ -> true -> "ok!"')
            .action((_, syntax) => {
            try {
                grammar_1.parser.parse(syntax);
                return 'parsing succeed! should work!';
            }
            catch (err) {
                return err.message;
            }
        });
        resp2.subcommand('.explain <reallyLongString:text>')
            .usage('解释语法')
            .example('resp2.explain $ -> true -> "ok!"')
            .action((_, syntax) => {
            try {
                const transformNames = (ip, isMatcher) => {
                    const { names, inline, async: isAsync, code } = ip;
                    let rtn = `${isAsync ? '[async]' : ''} ${inline ? '[inline]' : ''} \n`;
                    rtn += `${isAsync ? '|| async ' : '|| '}`;
                    if (!names) {
                        if (isMatcher)
                            rtn += `(session, context, resolve, reject) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
                        else
                            rtn += `(session, context, returnedValue) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
                    }
                    else {
                        rtn += `(${names.join(', ')}) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
                    }
                    return rtn;
                };
                if (syntax === 'current')
                    syntax = trigger;
                const parsed = grammar_1.parser.parse(syntax);
                const rtn = [];
                parsed.forEach((line, index) => {
                    rtn.push(`[${index}]:`);
                    if (Array.isArray(line)) {
                        return rtn.push(`注释: ${line[1]}`);
                    }
                    const cond = line.cond;
                    const action = line.action;
                    if (['startsWith', 'includes'].includes(cond.type)) {
                        rtn.push(`|| 触发条件:\n|| session.content.${cond.type}('${cond.content}')`);
                    }
                    else if (cond.type === 'equals') {
                        const equals = cond.eq.split('eq').join('=');
                        rtn.push(`|| 触发条件:\n|| session.content ${equals} '${cond.content}'`);
                    }
                    else if (cond.type === 'exec') {
                        rtn.push(`|| 自定义触发函数: ${transformNames(cond, true)}`);
                    }
                    rtn.push('|| ⬇️');
                    if (action.type === 'Literal') {
                        rtn.push(`|| 固定回复:\n|| '${action.value}'`);
                    }
                    else if (action.type === 'exec') {
                        rtn.push(`|| 自定义回复函数: ${transformNames(action, false)}`);
                    }
                });
                return rtn.join('\n');
            }
            catch (err) {
                return `error when parsing: ${err.stack}`;
            }
        });
    }
    catch (err) {
        ctx.logger('responder2').error(err);
    }
}
exports.apply = apply;
