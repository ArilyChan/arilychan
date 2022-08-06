import { Context, Schema, Session } from 'koishi'
import { parser } from './grammar'
import { build as exec } from './runtime/builder'

export type returnedValue = any
export type CustomMatcher = (
  session: Session,
  context: Context,
  resolve: (carry: returnedValue) => void,
  reject: () => void
) => Promise<returnedValue> | returnedValue
export type Action = (
  session: Session,
  context: Context,
  returnedValue: returnedValue
) => Promise<string | undefined>

export type Match = CustomMatcher
export type Respond = [Match, Action]

export function commandBuilder (logger): [Respond[], CallableFunction] {
  const matches: Respond[] = []
  return [
    matches,
    (command, index) => {
      if (Array.isArray(command)) return
      if (command.type !== 'incomingMessage') return
      let matchRule: Match
      const cond = command.cond
      switch (cond.type) {
        case 'startsWith':
          matchRule = (session) => session.content.startsWith(cond.content)
          break
        case 'includes':
          matchRule = (session) => session.content.includes(cond.content)
          break
        case 'equals':
          if (cond.eq === 'strictEqual') matchRule = (session) => session.content === cond.content
          // eslint-disable-next-line eqeqeq
          if (cond.eq === 'equal') matchRule = (session) => session.content == cond.content
          if (cond.eq === 'eq') {
            logger('responder2').warn(`got 'assignment operator' in rules #${index}, auto-corret to double equal.`)
            // eslint-disable-next-line eqeqeq
            matchRule = (content) => content == cond.content
          }
          break
        case 'exec':
          if (!cond.names) cond.names = {}
          matchRule = exec(cond.code, cond.names, { async: cond.async, inline: cond.inline, isMatcher: true }) as Match
      }
      const action = command.action
      let run
      switch (action.type) {
        case 'Literal':
          run = () => action.value
          break
        case 'exec':
          if (!action.names) action.names = {}
          run = exec(action.code, action.names, { async: action.async, inline: action.inline, isAction: true })
      }
      matches.push([matchRule, run])
    }
  ]
}

export const name = 'yet-another-responder'
export const schema = Schema.object({
  rules: Schema.array(String).description('match rules.').default(['// add more down below', '// don\'t leave rules empty'])
})
export interface Options {
  rules: string[]
}
export function apply (ctx: Context, options: Options) {
  const trigger = options.rules.join('\n')
  try {
    const [matches, builder] = commandBuilder(ctx.logger('resp2/builder'))
    const reader = parser.parse(trigger)
    reader.forEach(builder)
    ctx.middleware(async (session, next) => {
      for (const [match, run] of matches) {
        let receivedMatcherResolvedValue = false
        let matcherResolvedValue
        const returnedValue = match(session, ctx, (result) => {
          matcherResolvedValue = result
          receivedMatcherResolvedValue = true
        }, () => {
          matcherResolvedValue = false
          receivedMatcherResolvedValue = true
        })

        if (receivedMatcherResolvedValue) {
          if (!matcherResolvedValue) {
            continue
          }
        } else if (!returnedValue) {
          continue
        }

        const rtn = await run(session, ctx, matcherResolvedValue || returnedValue)
        if (!rtn) return
        return rtn.toString()
      }
      return await next()
    })
    const resp2 = ctx.command('responder2').alias('resp2').usage('可以在配置里写函数的应答器')
    resp2.subcommand('.test <reallyLongString:text>')
      .usage('测试responder2语法是否合法')
      .example('resp2.test $ -> true -> "ok!"')
      .action((_, syntax) => {
        try {
          parser.parse(syntax)
          return 'parsing succeed! should work!'
        } catch (err) {
          return err.message
        }
      })
    resp2.subcommand('.explain <reallyLongString:text>')
      .usage('解释语法')
      .example('resp2.explain $ -> true -> "ok!"')
      .action((_, syntax) => {
        try {
          const transformNames = (ip, isMatcher) => {
            const { names, inline, async: isAsync, code } = ip
            let rtn = `${isAsync ? '[async]' : ''} ${inline ? '[inline]' : ''} \n`
            rtn += `${isAsync ? '|| async ' : '|| '}`
            if (!names) {
              if (isMatcher) rtn += `(session, context, resolve, reject) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
              else rtn += `(session, context, returnedValue) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
            } else {
              rtn += `(${names.join(', ')}) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
            }
            return rtn
          }
          if (syntax === 'current') syntax = trigger
          const parsed = parser.parse(syntax)
          const rtn = []
          parsed.forEach((line, index) => {
            rtn.push(`[${index}]:`)
            if (Array.isArray(line)) { return rtn.push(`注释: ${line[1]}`) }
            const cond = line.cond
            const action = line.action
            if (['startsWith', 'includes'].includes(cond.type)) {
              rtn.push(`|| 触发条件:\n|| session.content.${cond.type}('${cond.content}')`)
            } else if (cond.type === 'equals') {
              const equals = cond.eq.split('eq').join('=')
              rtn.push(`|| 触发条件:\n|| session.content ${equals} '${cond.content}'`)
            } else if (cond.type === 'exec') {
              rtn.push(`|| 自定义触发函数: ${transformNames(cond, true)}`)
            }
            rtn.push('|| ⬇️')
            if (action.type === 'Literal') {
              rtn.push(`|| 固定回复:\n|| '${action.value}'`)
            } else if (action.type === 'exec') {
              rtn.push(`|| 自定义回复函数: ${transformNames(action, false)}`)
            }
            // if (index < parsed.length - 1) {
            // }
          })
          return rtn.join('\n')
        } catch (err) {
          return `error when parsing: ${err.stack}`
        }
      })
  } catch (err) {
    ctx.logger('responder2').error(err)
  }
}
