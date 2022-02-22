const { Schema } = require('koishi')

const nyaned = /喵([^\p{L}\d\s@#]+)?( +)?$/u
const trailingChars = /(?<content>.*?)(?<trailing>[^\p{L}\d\s@#]+)?(?<trailingSpace> +)?$/u
const transformToMoeTrailing = /[^.。][.。]$/

const nyan = (message, noiseMaker, { appendTrailing, transformLastLineOnly }) => {
  if (transformLastLineOnly) message = message?.trim() || message
  return message?.split?.('\n').map((line, index, lines) => {
    if (transformLastLineOnly && index < lines.length - 1) { return line }
    if (line.trim() === '') return line
    if (nyaned.test(line)) return line
    const noise = noiseMaker()
    const { groups: { content, trailing, trailingSpace } } = line.match(trailingChars)
    line = `${content ?? ''}${noise}${trailing ?? ''}${trailingSpace ?? ''}`
    line = line.slice(-1) === noise ? line + appendTrailing : line
    line = line.replace(transformToMoeTrailing, '~')
    return line
  })
    .join('\n') || message
}

const shuffle = (arr) => {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

const makeNoise = (noises) => {
  let randomNoise = shuffle([...noises])
  return function makeNoise () {
    if (randomNoise.length === 0) randomNoise = shuffle([...noises])
    return randomNoise.pop()
  }
}

const schema = Schema.object({
  noises: Schema.array(String).default(['喵']).description('您的bot会在最后发出什么声音?'),
  appendTrailing: Schema.string().default('').description('没有标点的句末后面会被加上这个，可以设置为比如`~`'),
  transformLastLineOnly: Schema.boolean().default(false).description('只在最后一行卖萌，默认每行都卖。')
})
module.exports = {
  name: 'nyan',
  schema,
  apply (ctx, options) {
    const { noises } = options = new Schema(options)
    ctx.any().before('send', (session) => {
      const noiseMaker = makeNoise(noises)
      session.content = nyan(session.content, noiseMaker, options)
    })
  }
}
