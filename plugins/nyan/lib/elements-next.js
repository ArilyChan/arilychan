"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
exports.name = 'nyan';
exports.schema = koishi_1.Schema.object({
    noises: koishi_1.Schema.array(String)
        .default(['喵'])
        .description('您的bot会在最后发出什么声音?'),
    transformLastLineOnly: koishi_1.Schema.boolean()
        .default(false)
        .description('只在最后一行卖萌，默认每行都卖。'),
    trailing: koishi_1.Schema.object({
        append: koishi_1.Schema.string()
            .default('')
            .description('没有标点的句末后面会被加上这个，可以设置为比如`~`'),
        transform: koishi_1.Schema.array(koishi_1.Schema.object({
            occurrence: koishi_1.Schema.string()
                .required()
                .description('要被替换掉的标点符号'),
            replaceWith: koishi_1.Schema.string()
                .required()
                .description('要替换为的标点符号')
        }))
            .default([
            { occurrence: '.', replaceWith: '~' },
            { occurrence: '。', replaceWith: '～' }
        ])
            .description('替换掉据尾的标点符号，两个以上连在一起的标点符号不会被换掉。*只对标点符号有反应！*')
    }).description('设置如何处理句尾')
});
// non-handling matches
const madeNoise = /喵([^\p{L}\d\s@#]+)?( +)?$/u;
const trailingURL = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//<>{}]*)?$/u;
const endsWithCQCode = /\[[cqCQ](.*)\]$/u;
// matcher
const trailingChars = /(?<content>.*?)(?<trailing>[^\p{L}\d\s@#]+)?(?<trailingSpace> +)?$/u;
const withDefault = (_default) => (template, ...args) => {
    let returnValue = '';
    template.forEach((val, index) => {
        returnValue += val;
        if (args[index] === false) {
            returnValue += 'false';
        }
        else if (args[index]) {
            returnValue += args[index];
        }
        else {
            returnValue += _default;
        }
    });
    return returnValue;
};
const _transform = (trailingChars, transforms) => {
    // expect transforms is not empty
    const last = trailingChars.slice(-1);
    // not handling anything that repeats eg. .. ,, 。。
    if (trailingChars.length > 1) {
        const secondLast = trailingChars.slice(-2, -1);
        if (last === secondLast)
            return trailingChars;
    }
    for (const { occurrence, replaceWith } of transforms) {
        if (last !== occurrence)
            continue;
        return trailingChars.slice(0, -1) + replaceWith;
    }
    return trailingChars;
};
const nyan = (_elements, noiseMaker, { trailing: { append, transform }, transformLastLineOnly }) => {
    if (!_elements?.length)
        return _elements;
    const elements = [..._elements];
    console.log(elements);
    // preserve empty lines at the end of the message. It's totally useless but why not?
    const end = [];
    for (let i = elements.length - 1; i >= 0; i--) {
        const line = elements[i];
        if (line.type === 'text' && line.attrs.content !== '') {
            break;
        }
        end.push(line);
        elements.pop();
    }
    // transform message
    const returnValue = elements
        .map((seg, index, lines) => {
        // unhandled conditions
        if (transformLastLineOnly && index < lines.length - 1) {
            return seg;
        }
        if (seg.type !== 'text')
            return seg;
        let line = seg.attrs.content;
        if (line.trim() === '') {
            return seg;
        }
        if (madeNoise.test(line)) {
            return seg;
        }
        if (endsWithCQCode.test(line)) {
            return seg;
        }
        if (trailingURL.test(line)) {
            return seg;
        }
        // handled
        const noise = noiseMaker();
        let { groups: { content, trailing, trailingSpace } } = line.match(trailingChars);
        if (!trailing)
            trailing = append;
        else if (transform.length)
            trailing = _transform(trailing, transform);
        line = withDefault('') `${content}${noise}${trailing}${trailingSpace}`;
        seg.attrs.content = line;
        return seg;
    })
        // append trailing spaces
        .concat(end.reverse());
    return returnValue;
};
// TODO: use element api, only handles string content.
const nyanLegacy = (_message, noiseMaker, { trailing: { append, transform }, transformLastLineOnly }) => {
    if (!_message)
        return _message;
    // preserve empty lines at the end of the message. It's totally useless but why not?
    const message = _message?.split?.('\n');
    const end = [];
    for (let i = message.length - 1; i >= 0; i--) {
        const line = message[i];
        if (line.trim() !== '')
            break;
        end.push(line);
        message.pop();
    }
    // transform message
    const returnValue = message
        .map((line, index, lines) => {
        // unhandled conditions
        if (transformLastLineOnly && index < lines.length - 1) {
            return line;
        }
        if (line.trim() === '') {
            return line;
        }
        if (madeNoise.test(line)) {
            return line;
        }
        if (endsWithCQCode.test(line)) {
            return line;
        }
        if (trailingURL.test(line)) {
            return line;
        }
        // handled
        const noise = noiseMaker();
        let { groups: { content, trailing, trailingSpace } } = line.match(trailingChars);
        if (!trailing)
            trailing = append;
        else if (transform.length)
            trailing = _transform(trailing, transform);
        line = withDefault('') `${content}${noise}${trailing}${trailingSpace}`;
        return line;
    })
        // append trailing spaces
        .concat(end.reverse())
        .join('\n');
    return returnValue;
};
const shuffle = (arr) => arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
const makeNoise = (noises) => {
    let randomNoise = shuffle([...noises]);
    return function makeNoise() {
        if (randomNoise.length === 0)
            randomNoise = shuffle([...noises]);
        return randomNoise.pop();
    };
};
function apply(ctx, options) {
    const { noises } = options;
    console.log('loaded');
    ctx.middleware((session, next) => {
        if (session.content === 'nyan') {
            return 'i am here';
        }
    });
    ctx.any().on('before-send', (session) => {
        console.log('triggered');
        const noiseMaker = makeNoise(noises);
        session.elements = nyan(session.elements, noiseMaker, options);
        session.content = session.elements.join('');
    });
    ctx.on('send', (session) => console.log(session));
}
exports.apply = apply;
