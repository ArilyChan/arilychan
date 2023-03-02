"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unescapeSpecialChars = void 0;
function unescapeSpecialChars(c2) {
    const specialChars = {
        '&': '&amp;',
        '[': '&#91;',
        ']': '&#93;',
        ',': '&#44;'
    };
    if (!c2)
        return '';
    let char = c2.toString();
    Object.entries(specialChars).forEach(([replace, find]) => {
        char = char.split(find).join(replace);
    });
    return char;
}
exports.unescapeSpecialChars = unescapeSpecialChars;
