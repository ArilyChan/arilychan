function RollReaction ({ exclusive = [] } = {}) {
  this.exclusive = exclusive
}
RollReaction.prototype.reactTo = function ({ command, meta }) {
  if (this.exclusive.includes(meta.groupId)) return false
  const message = []
  if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`)
  try {
    const rand = Math.round(Math.random())
    const words = command.join(' ').trim()
    const anyMagic = /([(（]?.*[)），,])?(.+)([不没])(.+)/
    const wordMatch = /(.*) or not(.)?/

    let matches = anyMagic.exec(words)
    // console.log(matches);
    if (matches != null &&
            matches[2] !== '' &&
            matches[4] !== '' &&
            // same start is required to filter unneeded rolls
            matches[4].startsWith(matches[2][0]) &&
            // reflect attack to cabbage
            !matches[2].startsWith('!') &&
            !matches[2].startsWith('！')
    ) {
      let title = matches[1] === undefined ? '' : matches[1]
      // remove () and ,
      title = title.replace(/[(（）)，,]/g, '')
      title = title.replace('[CQ:atqq=', '[CQ:at,qq=')
      let cond = matches[4]
      if (title.startsWith('我')) {
        title = cond.replace('我', '你')
        cond = cond.replace('你', '我')
      }
      // message.push(rand ? `${title}${matches[4]}`: `${title}${matches[3]}${matches[4]}`)
      message.push(`${title}${rand ? cond : matches[3] + cond}`.replace('不我是', '我不是'))
    } else {
      matches = wordMatch.exec(words)
      if (matches != null) {
        message.push(rand ? matches[1] : 'No')
      } else {
        return false
      }
    }
    meta.$send(message.join('\n')).catch(e => console.error.bind(console))
    return true
  } catch (Error) {

  }
  return false
}

module.exports = RollReaction
