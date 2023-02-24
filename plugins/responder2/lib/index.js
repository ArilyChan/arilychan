"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = exports.commandBuilder = void 0;
const koishi_1 = require("koishi");
const grammar_1 = require("./grammar");
const builder_1 = require("./runtime/builder");
// const beautify = require('js-beautify').js
const js_beautify_1 = require("js-beautify");
function commandBuilder() {
    const matches = [];
    return [
        matches,
        (command, index) => {
            if (Array.isArray(command))
                return;
            if (command.type !== 'incomingMessage')
                return;
            let matchRule;
            const matcher = command.cond;
            switch (matcher.type) {
                case 'startsWith':
                    matchRule = (session) => session.content.startsWith(matcher.content);
                    break;
                case 'includes':
                    matchRule = (session) => session.content.includes(matcher.content);
                    break;
                case 'equals':
                    if (matcher.eq === 'strictEqual')
                        matchRule = (session) => session.content === matcher.content;
                    // eslint-disable-next-line eqeqeq
                    if (matcher.eq === 'equal')
                        matchRule = (session) => session.content == matcher.content;
                    if (matcher.eq === 'eq') {
                        new koishi_1.Logger('responder2/builder').warn(`got 'assignment operator' in rules #${index}, auto-correct to double equal.`);
                        // eslint-disable-next-line eqeqeq
                        matchRule = (session) => session.content == matcher.content;
                    }
                    break;
                case 'exec':
                    if (!matcher.variables)
                        matcher.variables = [];
                    matchRule = (0, builder_1.build)(matcher.code, matcher.variables, { async: matcher.async, inline: matcher.inline, isMatcher: true });
                    break;
                default:
                    console.log(matcher);
                    throw new Error('unexpected condition type: ' + matcher.type);
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
            matches.push([matchRule, run, command]);
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
        const [matches, builder] = commandBuilder();
        ctx.logger('responder2').debug(trigger);
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
                    const matcher = line.cond;
                    const action = line.action;
                    if (matcher.type === 'startsWith' || matcher.type === 'includes') {
                        rtn.push(`|| 触发条件:\n|| session.content.${matcher.type}('${matcher.content}')`);
                    }
                    else if (matcher.type === 'equals') {
                        const equals = matcher.eq.split('eq').join('=');
                        rtn.push(`|| 触发条件:\n|| session.content ${equals} '${matcher.content}'`);
                    }
                    else if (matcher.type === 'exec') {
                        rtn.push(`|| 自定义触发函数: ${transformVariables(matcher, true)}`);
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
        resp2.subcommand('.compile <reallyLongString:text>')
            .usage('编译到javascript')
            .example('resp2.compile $ -> true -> "ok!"')
            .action((_, syntax) => {
            if (syntax === 'current')
                syntax = trigger;
            try {
                const q = koishi_1.segment.unescape(syntax);
                const parsed = grammar_1.parser.parse(q);
                const [matches, builder] = commandBuilder();
                parsed.forEach(builder);
                const inner = matches.map(([matcher, action, command]) => {
                    let matchContent = '';
                    let actionContent = '';
                    if (command.cond.type !== 'exec') {
                        matchContent = `const matcher = ${JSON.stringify(command.cond)}`;
                    }
                    if (command.action.type !== 'exec') {
                        actionContent = `const action = ${JSON.stringify(command.action)}`;
                    }
                    return `
  context.middleware(async (session, next) => {
    let matcherResolvedValue, receivedMatcherResolvedValue
    const resolve = (result) => {
      matcherResolvedValue = result
      receivedMatcherResolvedValue = true
    }
    const reject = () => {
      matcherResolvedValue = false
      receivedMatcherResolvedValue = true
    }
    ${matchContent}
    ${actionContent}
    const match$ = ${matcher}
    const action$ = ${action}

    const returnValue = ${command.cond.type === 'exec' && command.cond.async === true ? 'await' : ''} match$(session, context, resolve, reject)

    if (receivedMatcherResolvedValue && matcherResolvedValue) {
      return ${command.action.type === 'exec' && command.action.async === true ? 'await' : ''} action$(session, context, matcherResolvedValue)
    } else if (returnValue) {
      return ${command.action.type === 'exec' && command.action.async === true ? 'await' : ''} action$(session, context, returnValue)
    } else {
      return next()
    }
  })
`;
                }).join('');
                return (0, js_beautify_1.js)(`
function apply(context) {
${inner}
}`, { indent_size: 2, space_in_empty_paren: true });
            }
            catch (err) {
                return err.message;
            }
        });
    }
    catch (err) {
        ctx.logger('responder2').error(err);
    }
}
exports.apply = apply;
