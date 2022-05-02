"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
const grammar_1 = require("./grammar");
const builder_1 = require("./runtime/builder");
exports.name = 'yet-another-responder';
exports.schema = koishi_1.Schema.object({
    rules: koishi_1.Schema.array(String).description('match rules.').default(['// add more down below', '// don\'t leave rules empty'])
});
function apply(ctx, _options) {
    const options = new koishi_1.Schema(_options);
    const trigger = options.rules.join('\n');
    const matches = [];
    try {
        const reader = grammar_1.parser.parse(trigger);
        reader.forEach((command, index) => {
            if (Array.isArray(command))
                return;
            if (command.type !== 'incomingMessage')
                return;
            let matchRule;
            const cond = command.cond;
            switch (cond.type) {
                case 'startsWith':
                    matchRule = (content) => content.startsWith(cond.content);
                    break;
                case 'includes':
                    matchRule = (content) => content.includes(cond.content);
                    break;
                case 'equals':
                    if (cond.eq === 'eqeqeq')
                        matchRule = (content) => content === cond.content;
                    if (cond.eq === 'eqeq')
                        matchRule = (content) => content == cond.content;
                    if (cond.eq === 'eq') {
                        ctx.logger('responder2').warn(`got left assign in rules #${index}, auto-corret to double equal.`);
                        matchRule = (content) => content == cond.content;
                    }
                    break;
                case 'exec':
                    if (!cond.names)
                        cond.names = {};
                    matchRule = (0, builder_1.build)(cond.code, cond.names, { async: cond.async, inline: cond.inline });
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
                    run = (0, builder_1.build)(action.code, action.names, { async: action.async, inline: action.inline });
            }
            matches.push([matchRule, run]);
        });
        ctx.middleware(async (session, next) => {
            for (const [match, run] of matches) {
                const matched = match(session.content);
                if (!matched)
                    continue;
                const rtn = await run(session, ctx);
                if (!rtn)
                    return;
                return rtn.toString();
            }
            return next();
        });
    }
    catch (err) {
        ctx.logger('responder2').error(err);
    }
}
exports.apply = apply;
