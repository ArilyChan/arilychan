import { Context, Schema, Session, segment } from 'koishi'
import { parser } from './grammar'
import { build as exec, rebuildVariableString } from './runtime/builder'

export type Variable = string | {
  type: 'object-destructuring' | 'array-destructuring'
  destructed: string
  variables: Variable[]
} | {
  type: 'rename'
  from: string
  to: string
}
export interface literal {
  type: 'literal'
  value: string
}
export interface Executable {
  type: 'exec'

  async: boolean
  inline: boolean

  code: string
  variables?: Variable[]
}

export type ConditionalMatcher = ({
  type: 'startsWith' | 'includes'
} | {
  type: 'equals'
  eq: string
}) & {
  content: string
}
export interface Command {
  type: string
  cond: Executable | ConditionalMatcher
  action: Executable | literal
}

export type returnedValue = any

export type CustomMatcher = (
  session: Session,
  context: Context,
  resolve: (carry: returnedValue) => void,
  reject: () => void
) => Promise<returnedValue> | returnedValue
export type ActionFunction = (
  session: Session,
  context: Context,
  returnedValue: returnedValue
) => Promise<string | undefined | { toString: () => string }> | string | undefined | { toString: () => string }

export type MatchFunction = CustomMatcher
export type Entry = [MatchFunction, ActionFunction]

export function commandBuilder (logger): [Entry[], CallableFunction] {
  const matches: Entry[] = []
  return [
    matches,
    (command: Command, index): void => {
      if (Array.isArray(command)) return
      if (command.type !== 'incomingMessage') return
      let matchRule: MatchFunction
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
            matchRule = (session) => session.content == cond.content
          }
          break
        case 'exec':
          if (!cond.variables) cond.variables = []
          matchRule = exec(cond.code, cond.variables, { async: cond.async, inline: cond.inline, isMatcher: true }) as MatchFunction
      }
      const action = command.action
      let run: ActionFunction
      switch (action.type) {
        case 'literal':
          run = () => action.value
          break
        case 'exec':
          if (!action.variables) action.variables = []
          run = exec(action.code, action.variables, { async: action.async, inline: action.inline, isAction: true }) as ActionFunction
      }
      matches.push([matchRule, run])
    }
  ]
}

export const name = 'yet-another-responder'
export const schema = Schema.object({
  rules: Schema.array(Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false)
    }),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        content: Schema.string().role('textarea')
      }),
      Schema.object({})
    ])
  ])).description('match rules.').default([{
    enabled: true,
    content: '// add more down below'
  }, {
    enabled: true,
    content: '// don\'t leave rules empty'
  }])
})
export interface Options {
  rules: Array<{enabled: boolean, content: string }>
}
export function apply (ctx: Context, options: Options) {
  try {
    const trigger = options.rules.filter(rule => rule.enabled).map(rule => rule.content).join('\n')
    console.log(trigger)
    const [matches, builder] = commandBuilder(ctx.logger('responder2/builder'))
    const reader = parser.parse(trigger)
    reader.forEach(builder)
    ctx.middleware(async (session, next) => {
      const escapedSession = new Proxy(session, {
        get (target, key, receiver) {
          if (key === 'content') {
            return segment.unescape(target.content)
          } else {
            return target[key]
          }
        }
      })

      for (const [match, run] of matches) {
        let receivedMatcherResolvedValue = false
        let matcherResolvedValue

        const returnedValue = match(escapedSession, ctx, (result) => {
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

        const rtn = await run(escapedSession, ctx, matcherResolvedValue ?? returnedValue)
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
          const transformvariables = (ip, isMatcher) => {
            const { variables, inline, async: isAsync, code } = ip
            let rtn = `${isAsync ? '[async]' : ''} ${inline ? '[inline]' : ''} \n`
            rtn += `${isAsync ? '|| async ' : '|| '}`
            if (!variables) {
              if (isMatcher) rtn += `(session, context, resolve, reject) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
              else rtn += `(session, context, returnedValue) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
            } else {
              // this throws an error if the code is invalid
              exec(ip.code, ip.variables, { async: ip.async, inline: ip.inline, isAction: true })

              rtn += `(${variables.map(rebuildVariableString).join(', ')}) => ${inline ? code.trim() : `{ ${code.trim()} }`}`
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
              rtn.push(`|| 自定义触发函数: ${transformvariables(cond, true)}`)
            }
            rtn.push('|| ⬇️')
            if (action.type === 'literal') {
              rtn.push(`|| 固定回复:\n|| '${action.value}'`)
            } else if (action.type === 'exec') {
              rtn.push(`|| 自定义回复函数: ${transformvariables(action, false)}`)
            }
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
