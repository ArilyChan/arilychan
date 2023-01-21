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
                        logger('responder2').warn(`got 'assignment operator' in rules #${index}, auto-correct to double equal.`);
                        // eslint-disable-next-line eqeqeq
                        matchRule = (session) => session.content == cond.content;
                    }
                    break;
                case 'exec':
                    if (!cond.variables)
                        cond.variables = [];
                    matchRule = (0, builder_1.build)(cond.code, cond.variables, { async: cond.async, inline: cond.inline, isMatcher: true });
                    break;
                default:
                    console.log(cond);
                    throw new Error('unexpected condition type: ' + cond.type);
            }
            const action = command.action;
            let run;
            switch (action.type) {
                case 'literal':
                    run = () => action.value;
                    break;
                case 'exec':
                    if (!action.variables)
                        action.variables = [];
                    run = (0, builder_1.build)(action.code, action.variables, { async: action.async, inline: action.inline, isAction: true });
            }
            matches.push([matchRule, run]);
        }
    ];
}
exports.commandBuilder = commandBuilder;
exports.name = 'yet-another-responder';
exports.schema = koishi_1.Schema.object({
    rules: koishi_1.Schema.array(koishi_1.Schema.intersect([
        koishi_1.Schema.object({
            enabled: koishi_1.Schema.boolean().default(false)
        }),
        koishi_1.Schema.union([
            koishi_1.Schema.object({
                enabled: koishi_1.Schema.const(true).required(),
                content: koishi_1.Schema.string().role('textarea')
            }),
            koishi_1.Schema.object({})
        ])
    ])).description('match rules.').default([{
            enabled: true,
            content: '// add more down below'
        }, {
            enabled: true,
            content: '// don\'t leave rules empty'
        }])
});
function apply(ctx, options) {
    try {
        const trigger = options.rules.filter(rule => rule.enabled).map(rule => rule.content).join('\n');
        console.log(trigger);
        const [matches, builder] = commandBuilder(ctx.logger('responder2/builder'));
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
                const transformVariables = (ip, isMatcher) => {
                    const { variables, inline, async: isAsync, code } = ip;
                    let rtn = `${isAsync ? '[async]' : ''} ${inline ? '[inline]' : ''} \n`;
                    rtn += `${isAsync ? '|| async ' : '|| '}`;
                    if (!variables) {
                        if (isMatcher)
                            rtn += `(session, context, resolve, reject) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
                        else
                            rtn += `(session, context, returnedValue) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
                    }
                    else {
                        // this throws an error if the code is invalid
                        (0, builder_1.build)(ip.code, ip.variables, { async: ip.async, inline: ip.inline, isAction: true });
                        rtn += `(${variables.map(builder_1.rebuildVariableString).join(', ')}) => ${inline ? code.trim() : `{ ${code.trim()} }`}`;
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
                        rtn.push(`|| 自定义触发函数: ${transformVariables(cond, true)}`);
                    }
                    rtn.push('|| ⬇️');
                    if (action.type === 'literal') {
                        rtn.push(`|| 固定回复:\n|| '${action.value}'`);
                    }
                    else if (action.type === 'exec') {
                        rtn.push(`|| 自定义回复函数: ${transformVariables(action, false)}`);
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
