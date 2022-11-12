import { Schema, Context, segment, version } from 'koishi'

export const name = 'nyan'

type Opt = {
  noises: string[]
  transformLastLineOnly: boolean
  legacyMode: boolean
  trailing: {
    append: string
    transform: Array<{
      occurrence: string
      replaceWith: string
    }>
  }
}

const [major, minor] = (version as string).split('.').map(i => parseInt(i))

const fallback = major === 4 && minor < 10

export const schema = Schema.object({
  noises: Schema.array(String)
    .default(['喵'])
    .description('您的bot会在最后发出什么声音?'),

  transformLastLineOnly: Schema.boolean()
    .default(false)
    .description('只在最后一行卖萌，默认每行都卖。'),

  legacyMode: Schema.boolean()
    .default(fallback)
    .description('兼容性模式，非必要不需要开。4.10以后默认关闭。'),

  trailing: Schema.object({
    append: Schema.string()
      .default('')
      .description('没有标点的句末后面会被加上这个，可以设置为比如`~`'),

    transform: Schema.array(
      Schema.object({
        occurrence: Schema.string()
          .required()
          .description('要被替换掉的标点符号'),
        replaceWith: Schema.string()
          .required()
          .description('要替换为的标点符号')
      })
    )
      .default([
        { occurrence: '.', replaceWith: '~' },
        { occurrence: '。', replaceWith: '～' }
      ])
      .description(
        '替换掉据尾的标点符号，两个以上连在一起的标点符号不会被换掉。*只对标点符号有反应！*'
      )
  }).description('设置如何处理句尾')
})

// non-handling matches
const madeNoise = /喵([^\p{L}\d\s@#]+)?( +)?$/u
const trailingURL =
  /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//<>{}]*)?$/u
const endsWithCQCode = /\[[cqCQ](.*)\]$/u

// matcher
const trailingChars =
  /(?<content>.*?)(?<trailing>[^\p{L}\d\s@#]+)?(?<trailingSpace> +)?$/u

const withDefault =
  (_default: any) =>
    (template: TemplateStringsArray, ...args: any[]) => {
      let returnValue = ''
      template.forEach((val, index) => {
        returnValue += val
        if (args[index] === false) {
          returnValue += 'false'
        } else if (args[index]) {
          returnValue += args[index]
        } else {
          returnValue += _default
        }
      })
      return returnValue
    }

const _transform = (
  trailingChars: string,
  transforms: Opt['trailing']['transform']
) => {
  // expect transforms is not empty
  const last = trailingChars.slice(-1)

  // not handling anything that repeats eg. .. ,, 。。
  if (trailingChars.length > 1) {
    const secondLast = trailingChars.slice(-2, -1)
    if (last === secondLast) return trailingChars
  }

  for (const { occurrence, replaceWith } of transforms) {
    if (last !== occurrence) continue
    return trailingChars.slice(0, -1) + replaceWith
  }
  return trailingChars
}

const processSingleLine = (noiseMaker: () => string, { trailing: { append, transform }, transformLastLineOnly }: Opt) => (line, index, lines) => {
  // unhandled conditions
  if (transformLastLineOnly && index < lines.length - 1) {
    return line
  }
  if (line.trim() === '') {
    return line
  }
  if (madeNoise.test(line)) {
    return line
  }
  if (endsWithCQCode.test(line)) {
    return line
  }
  if (trailingURL.test(line)) {
    return line
  }

  // handled
  const noise = noiseMaker()
  let {
    groups: { content, trailing, trailingSpace }
  } = line.match(trailingChars)

  if (!trailing) trailing = append
  else if (transform.length) trailing = _transform(trailing, transform)

  line = withDefault('')`${content}${noise}${trailing}${trailingSpace}`
  return line
}

const nyan = (
  _elements: segment[] | undefined,
  noiseMaker: () => string,
  options: Opt
) => {
  const { transformLastLineOnly } = options
  if (!_elements?.length) return _elements

  const elements = [..._elements]

  // preserve empty lines at the end of the message. It's totally useless but why not?
  const end: segment[] = []
  for (let i = elements.length - 1; i >= 0; i--) {
    const line = elements[i]
    if (line.type === 'text' && line.attrs.content !== '') { break }
    end.push(line)
    elements.pop()
  }

  // transform message
  const returnValue = elements
    .map((seg: segment, index: number, lines: segment[]): segment => {
      // unhandled conditions
      if (transformLastLineOnly && index < lines.length - 1) {
        return seg
      }
      if (seg.type !== 'text') return seg

      const _lines = seg.attrs.content.split('\n').map(processSingleLine(noiseMaker, options))

      seg.attrs.content = _lines.join('\n')
      return seg
    })
    // append trailing spaces
    .concat(end.reverse())
  return returnValue
}

// TODO: use element api, only handles string content.
const nyanLegacy = (
  _message: string,
  noiseMaker: () => string,
  options
) => {
  if (!_message) return _message

  // preserve empty lines at the end of the message. It's totally useless but why not?
  const message: string[] = _message?.split?.('\n')
  const end = []
  for (let i = message.length - 1; i >= 0; i--) {
    const line = message[i]
    if (line.trim() !== '') break
    end.push(line)
    message.pop()
  }

  // transform message
  const returnValue = message
    .map(processSingleLine(noiseMaker, options))
    // append trailing spaces
    .concat(end.reverse())
    .join('\n')
  return returnValue
}

const shuffle = <T>(arr: T[]) =>
  arr
    .map((value: T) => ({ value, sort: Math.random() }))
    .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
    .map(({ value }) => value)

const makeNoise = (noises: string[]) => {
  let randomNoise = shuffle([...noises])
  return function makeNoise () {
    if (randomNoise.length === 0) randomNoise = shuffle([...noises])
    return randomNoise.pop()
  }
}

export function apply (ctx: Context, options: Opt) {
  const { noises } = options

  ctx.any().on('before-send', (session) => {
    const noiseMaker = makeNoise(noises)
    if (options.legacyMode) {
      session.content = nyanLegacy(session.content, noiseMaker, options)
    } else {
      session.elements = nyan(session.elements, noiseMaker, options)
    }
  })
}
