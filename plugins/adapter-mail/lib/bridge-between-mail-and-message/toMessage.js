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
                segments.push(koishi_1.segment.text(trimmed));
            }
        }
    });
    html && parser.write(html);
    return (segments.length && segments) || (text && [koishi_1.segment.text(text?.toString('utf-8'))]) || undefined;
};
const extractMessage = (mail) => {
    if (mail.html) {
        return extractMessageFromHtml(mail);
    }
    else if (mail.text)
        return [koishi_1.segment.text(mail.text.toString('utf-8'))];
    else {
        logger.debug(mail);
        return Promise.reject(Error('unable to process message'));
    }
};
const separate = (_separator) => async (segs) => {
    const separator = new RegExp(`(?<before>.*)(${_separator})(?<after>.*)`, 's');
    const returnSegs = [];
    for (const seg of segs) {
        switch (seg.type) {
            case 'text': {
                const matchResult = seg.attrs.content.match(separator);
                const _before = matchResult ? koishi_1.segment.text(matchResult.groups?.before) : seg;
                returnSegs.push(_before);
                if (matchResult) {
                    return returnSegs;
                }
                continue;
            }
            default: {
                logger.info(`unhandled fragment type: ${seg.type}`);
            }
        }
    }
    return returnSegs;
};
function pipeline({ separator = '% reply beyond this line %', messageIdExtractor = /#k-id=([^$]+)#/ } = {}) {
    const trimmer = separate(separator);
    return async (mail) => {
        let id;
        const content1 = await extractMessage(mail);
        if (!content1) {
            return;
        }
        const content2 = await trimmer(content1);
        const ids = mail.subject ? messageIdExtractor.exec(mail.subject) : undefined;
        if (ids) {
            id = ids[1];
        }
        return {
            content: content2,
            id
        };
    };
}
exports.pipeline = pipeline;
