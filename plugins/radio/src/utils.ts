export function unescapeSpecialChars (c2: unknown) {
  const specialChars = {
    '&': '&amp;',
    '[': '&#91;',
    ']': '&#93;',
    ',': '&#44;'
  }
  if (!c2) return ''
  let char = c2.toString()
  Object.entries(specialChars).forEach(([replace, find]) => {
    char = char.split(find).join(replace)
  })
  return char
}
