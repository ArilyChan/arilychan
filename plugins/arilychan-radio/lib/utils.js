'use strict'

class utils {
  static unescapeSpecialChars (chars) {
    const specialChars = {
      '&': '&amp;',
      '[': '&#91;',
      ']': '&#93;',
      ',': '&#44;'
    }
    chars = chars.toString()
    Object.entries(specialChars).map(([replace, find]) => {
      chars = chars.split(find).join(replace)
    })
    return chars
  }
}

module.exports = utils
