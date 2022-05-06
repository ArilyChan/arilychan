export const specialChars = {
  '&': '&amp;',
  '[': '&#91;',
  ']': '&#93;',
  ',': '&#44;'
}
export function unescapeOnebotSpecialChars (chars: string): string {
  chars = chars.toString()
  Object.entries(specialChars).forEach(([replace, find]) => {
    chars = chars.split(find).join(replace)
  })
  return chars
}
