'use strict'
const { Schema } = require('koishi')

const nyaned = /喵([^\p{L}\d\s@#]+)?( +)?$/u
const trailingChars = /(?<content>.*?)(?<trailing>[^\p{L}\d\s@#]+)?(?<trailingSpace> +)?$/u
const trailingURL = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//<>{}]*)?$/u
const endsWithCQCode = /\[[cqCQ](.*)\]$/u

const _transform = (trailing, transforms) => {
  // expect transforms is not empty
  const last = trailing.slice(-1)
  if (trailing.length > 1) {
    const secondLast = trailing.slice(-2, -1)
    if (last === secondLast) return trailing
  }
  for (const { occurrence, replaceWith } of transforms) {
    if (last !== occurrence) continue
    return trailing.slice(0, -1) + replaceWith
  }
  return trailing
}

const nyan = (message, noiseMaker, { trailing: { append, transform }, transformLastLineOnly }) => {
  if (!message?.length) return message
  // preserve empty lines at the end of the message. It's totally useless but why not?
  message = message?.split?.('\n')
  const end = []
  for (let i = message.length - 1; i >= 0; i--) {
    const line = message[i]
    if (line.trim() !== '') break
    end.push(line)
    message.pop()
  }
  // transform message
  message = message.map((line, index, lines) => {
    if (transformLastLineOnly && index < lines.length - 1) {
      return line
    }
    if (line.trim() === '') {
      return line
    }
    if (nyaned.test(line)) {
      return line
    }
    if (endsWithCQCode.test(line)) {
      return line
    }
    if (trailingURL.test(line)) {
      return line
    }
    const noise = noiseMaker()
    let { groups: { content, trailing, trailingSpace } } = line.match(trailingChars)
    if (!trailing) trailing = append
    else if (transform.length) trailing = _transform(trailing, transform)
    line = `${content ?? ''}${noise}${trailing ?? ''}${trailingSpace ?? ''}`
    return line
  })
    // append trailing spaces
    .concat(end.reverse())
    .join('\n') || message
  return message
}

const shuffle = (arr) => {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

const makeNoise = (noises) => {
  let randomNoise = shuffle([...noises])
  return function makeNoise() {
    if (randomNoise.length === 0) randomNoise = shuffle([...noises])
    return randomNoise.pop()
  }
}

const schema = Schema.object({
  noises: Schema.array(String).default(['喵']).description('您的bot会在最后发出什么声音?'),
  transformLastLineOnly: Schema.boolean().default(false).description('只在最后一行卖萌，默认每行都卖。'),
  trailing: Schema.object({
    append: Schema.string().default('').description('没有标点的句末后面会被加上这个，可以设置为比如`~`'),
    transform: Schema.array(Schema.object({
      occurrence: Schema.string().required().description('要被替换掉的标点符号'),
      replaceWith: Schema.string().required().description('要替换为的标点符号')
    })).default([{ occurrence: '.', replaceWith: '~' }, { occurrence: '。', replaceWith: '～' }]).description('替换掉据尾的标点符号，两个以上连在一起的标点符号不会被换掉。*只对标点符号有反应！*')
  }).description('设置如何处理句尾')
})
module.exports = {
  name: 'nyan',
  schema,
  apply(ctx, options) {
    const { noises } = options
    ctx.any().before('send', (session) => {
      const noiseMaker = makeNoise(noises)
      session.content = nyan(session.content, noiseMaker, options)
    })
  }
}
