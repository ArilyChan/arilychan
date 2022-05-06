"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unescapeOnebotSpecialChars = exports.specialChars = void 0;
exports.specialChars = {
    '&': '&amp;',
    '[': '&#91;',
    ']': '&#93;',
    ',': '&#44;'
};
function unescapeOnebotSpecialChars(chars) {
    chars = chars.toString();
    Object.entries(exports.specialChars).forEach(([replace, find]) => {
        chars = chars.split(find).join(replace);
    });
    return chars;
}
exports.unescapeOnebotSpecialChars = unescapeOnebotSpecialChars;
