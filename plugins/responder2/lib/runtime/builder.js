"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.rebuildVariableString = void 0;
const rebuildVariableString = (variable) => {
    if (typeof variable === 'string')
        return variable;
    else if (variable.type === 'array-destructuring') {
        return `[ ${variable.variables.map(exports.rebuildVariableString).join(', ')} ]`;
    }
    else if (variable.type === 'object-destructuring') {
        return `{ ${variable.variables.map(exports.rebuildVariableString).join(', ')} }`;
    }
    else if (variable.type === 'rename') {
        return `${variable.from}: ${variable.to}`;
    }
};
exports.rebuildVariableString = rebuildVariableString;
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
    return new Constructor(...variables.map(exports.rebuildVariableString), code);
}
exports.build = build;
