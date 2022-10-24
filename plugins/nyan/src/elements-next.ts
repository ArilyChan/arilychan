import { Schema, Context, Session} from 'koishi'

const nyaned = /喵([^\p{L}\d\s@#]+)?( +)?$/u;
const trailingChars =
  /(?<content>.*?)(?<trailing>[^\p{L}\d\s@#]+)?(?<trailingSpace> +)?$/u;
const trailingURL =
  /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//<>{}]*)?$/u;
const endsWithCQCode = /\[[cqCQ](.*)\]$/u;

const withDefault = (_default: any) => (template: TemplateStringsArray , ...args: any[]) => {
  let returnValue = ''
  template.forEach((val, index) => {
    returnValue += val
    if (args[index] === false)  {
      returnValue += 'false'
    } else if (args[index])  {
      returnValue += args[index]
    } else {
      returnValue += _default
    }
  })
  return returnValue
}

const _transform = (trailingChars: string, transforms: Opt['trailing']['transform']) => {
  // expect transforms is not empty
  const last = trailingChars.slice(-1);
  if (trailingChars.length > 1) {
    const secondLast = trailingChars.slice(-2, -1);
    if (last === secondLast) return trailingChars;
  }
  for (const { occurrence, replaceWith } of transforms) {
    if (last !== occurrence) continue;
    return trailingChars.slice(0, -1) + replaceWith;
  }
  return trailingChars;
};

const nyan = (
  _message: string,
  noiseMaker: () => string,
  {
    trailing: { append, transform },
    transformLastLineOnly,
  }: Opt
) => {
  if (!_message?.length) return _message;
  // preserve empty lines at the end of the message. It's totally useless but why not?
  let message: string[] = _message?.split?.("\n");
  const end = [];
  for (let i = message.length - 1; i >= 0; i--) {
    const line = message[i];
    if (line.trim() !== "") break;
    end.push(line);
    message.pop();
  }
  // transform message
  const returnValue = message
    .map((line: string, index: number, lines: string[]): string => {
      // unhandled conditions
      if (transformLastLineOnly && index < lines.length - 1) {
        return line;
      }
      if (line.trim() === "") {
        return line;
      }
      if (nyaned.test(line)) {
        return line;
      }
      if (endsWithCQCode.test(line)) {
        return line;
      }
      if (trailingURL.test(line)) {
        return line;
      }
      // handled
      const noise = noiseMaker();
      let {
        groups: { content, trailing, trailingSpace },
      } = line.match(trailingChars);

      if (!trailing) trailing = append;
      else if (transform.length) trailing = _transform(trailing, transform);

      line = withDefault('')`${content}${noise}${trailing}${trailingSpace}`;
      return line;
    })
    // append trailing spaces
    .concat(end.reverse())
    .join("\n");
  return returnValue;
};

const shuffle = <T>(arr: T[]) => {
  return arr
    .map((value: T) => ({ value, sort: Math.random() }))
    .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
    .map(({ value }) => value);
};

const makeNoise = (noises: string[]) => {
  let randomNoise = shuffle([...noises]);
  return function makeNoise() {
    if (randomNoise.length === 0) randomNoise = shuffle([...noises]);
    return randomNoise.pop();
  };
};

type Opt = {
  noises: string[]
  transformLastLineOnly: boolean
  trailing: {
    append: string
    transform: Array<{
      occurrence: string
      replaceWith: string
    }>
  }
}

const schema = Schema.object({
  noises: Schema.array(String)
    .default(["喵"])
    .description("您的bot会在最后发出什么声音?"),

  transformLastLineOnly: Schema.boolean()
    .default(false)
    .description("只在最后一行卖萌，默认每行都卖。"),

  trailing: Schema.object({
    append: Schema.string()
      .default("")
      .description("没有标点的句末后面会被加上这个，可以设置为比如`~`"),

    transform: Schema.array(
      Schema.object({
        occurrence: Schema.string()
          .required()
          .description("要被替换掉的标点符号"),
        replaceWith: Schema.string()
          .required()
          .description("要替换为的标点符号"),
      })
    )
      .default([
        { occurrence: ".", replaceWith: "~" },
        { occurrence: "。", replaceWith: "～" },
      ])
      .description(
        "替换掉据尾的标点符号，两个以上连在一起的标点符号不会被换掉。*只对标点符号有反应！*"
      ),
  }).description("设置如何处理句尾"),
});
module.exports = {
  name: "nyan",
  schema,
  apply(
    ctx: Context,
    options: Opt
  ) {
    const { noises } = options;
    ctx.any().before("send", (session: Session) => {
      const noiseMaker = makeNoise(noises);
      session.content = nyan(session.content, noiseMaker, options);
    });
  },
};
