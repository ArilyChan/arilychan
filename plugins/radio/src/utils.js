'use strict'

class utils {
  static unescapeSpecialChars (chars) {
    const specialChars = {
      '&': '&amp;',
      '[': '&#91;',
      ']': '&#93;',
      ',': '&#44;'
    }
    if (!chars) return ''
    chars = chars.toString()
    Object.entries(specialChars).forEach(([replace, find]) => {
      chars = chars.split(find).join(replace)
    })
    return chars
  }
}

export default utils
