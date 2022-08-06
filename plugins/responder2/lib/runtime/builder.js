"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
function build(code, variables, options) {
    let Constructor = Function;
    const { async, isMatcher, isAction } = options;
    if (async) {
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        Constructor = AsyncFunction;
    }
    if (options.inline)
        code = `return ${code}`;
    if (!variables.length && isMatcher)
        return new Constructor('session', 'context', 'resolve', 'reject', code);
    else if (!variables.length && isAction)
        return new Constructor('session', 'context', 'returnedValue', code);
    // TODO: support destructuring
    return new Constructor(...variables, code);
}
exports.build = build;
