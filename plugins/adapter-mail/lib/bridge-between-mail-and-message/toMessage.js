"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeline = void 0;
const jsx_runtime_1 = require("@satorijs/element/jsx-runtime");
const koishi_1 = require("koishi");
const htmlparser2 = __importStar(require("htmlparser2"));
const logger = new koishi_1.Logger('adapter-mail/transform/toMessage');
const resolveAttachment = (url, attachments) => {
    if (!attachments?.length)
        return;
    if (!url.startsWith('cid:')) {
        return;
    }
    const attachment = attachments.find(attachment => attachment.cid === url.slice(4));
    if (!attachment) {
        return;
    }
    return attachment.content;
};
const extractMessageFromHtml = async ({ html, text, attachments }) => {
    const segments = [];
    let skipInner = false;
    const parser = new htmlparser2.Parser({
        onopentag(name, attribs) {
            skipInner = true;
            if (['script', 'style'].includes(name)) {
                return;
            }
            if (name === 'img') {
                // TODO: img .src='data:image/{contentType},{encodeType},{encodedContent}'
                const src = attribs.src;
                const b64 = resolveAttachment(src, attachments)?.toString('base64');
                skipInner = false;
                // return segments.push(s('image', { url: (b64 && `data:image/png;base64, ${b64}`) || src }))
                return segments.push((0, jsx_runtime_1.jsx)("image", { url: (b64 && `data:image/png;base64, ${b64}`) || src }));
            }
            skipInner = false;
        },
        ontext(data) {
            const trimmed = data.trim();
            if (trimmed !== '') {
                if (skipInner) {
                    return;
                }
                segments.push((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: trimmed }));
            }
        }
    });
    html && parser.write(html);
    return segments || (text && (0, jsx_runtime_1.jsx)("text", { children: text })) || undefined;
};
const extractMessage = (mail) => {
    if (mail.html) {
        return extractMessageFromHtml(mail);
    }
    else if (mail.text)
        return [(0, jsx_runtime_1.jsx)("text", { children: "mail.text" })];
    else
        return Promise.reject(Error('unable to process message'));
};
// TODO maybe fix this?
const separate = (_separator, idTemplate) => async (text) => {
    // return text.reduce<Fragment[]>((acc, fragment) => {
    //
    //
    //   fragment = matchResult ? matchResult.groups?.before || '' + matchResult.groups?.after : fragment
    //   const ids = idTemplate.exec(fragment)
    //   if (ids) fragment = fragment.replace(idTemplate, '')
    //   return acc
    // }, [])
    const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's');
    const before = [];
    // const after: segment[] = []
    for (const fragment of text) {
        switch (fragment.type) {
            case 'text': {
                const matchResult = fragment.attrs.content.match(separator);
                const _before = matchResult ? (0, jsx_runtime_1.jsx)("text", { children: "matchResult.groups?.before" }) : fragment;
                before.push(_before);
                continue;
            }
            default: {
                new koishi_1.Logger('adapter-mail/toMessage').debug(`unhandled fragment type: ${fragment.type}`);
            }
        }
    }
    return {
        content: before,
        id: 1
    };
};
function pipeline({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ } = {}) {
    return async (mail) => {
        logger.debug(mail.html);
        logger.debug(mail.text);
        let id;
        const content1 = await extractMessage(mail);
        if (!content1) {
            return;
        }
        const ids = mail.subject ? messageIdExtractor.exec(mail.subject) : undefined;
        if (ids) {
            id = ids[1];
        }
        return {
            content: content1,
            id
        };
        // const { content, id } = await separate(separator, messageIdExtractor)(content1)
        // return { content, id }
    };
}
exports.pipeline = pipeline;
