import { Context, Schema, Session } from 'koishi'
import { parser } from './grammar'
import { build as exec } from './runtime/builder'
export type CustomMatcher = (session: Session, context: Context) => Promise<boolean> | boolean
export type Match = CustomMatcher
export type Action = (session: Session, context: Context) => string | Promise<string>
export type Respond = [Match, Action]
export function commandBuilder(logger): [Respond[], CallableFunction] {
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
          if (cond.eq === 'eqeqeq') matchRule = (content) => content === cond.content
          if (cond.eq === 'eqeq') matchRule = (content) => content == cond.content
          if (cond.eq === 'eq') {
            logger('responder2').warn(`got left assign in rules #${index}, auto-corret to double equal.`)
            matchRule = (content) => content == cond.content
          }
          break
        case 'exec':
          if (!cond.names) cond.names = {}
          matchRule = exec(cond.code, cond.names, { async: cond.async, inline: cond.inline }) as unknown as CustomMatcher
      }
      const action = command.action
      let run
      switch (action.type) {
        case 'Literal':
          run = () => action.value
          break;
        case 'exec':
          if (!action.names) action.names = {}
          run = exec(action.code, action.names, { async: action.async, inline: action.inline })
      }
      matches.push([matchRule, run])
    }
  ]
}
export const name = 'yet-another-responder'
export const schema = Schema.object({
  rules: Schema.array(String).description('match rules.').default(['// add more down below', '// don\'t leave rules empty'])
})
export interface schema {
  rules: string[]
}
export function apply(ctx: Context, _options) {
  const options = new Schema(_options) as unknown as schema
  const trigger = options.rules.join('\n')
  try {
    const [matches, builder] = commandBuilder(ctx.logger('resp2/builder'))
    const reader = parser.parse(trigger)
    reader.forEach(builder)
    ctx.middleware(async (session, next) => {
      for (const [match, run] of matches) {
        const matched = match(session, ctx)
        if (!matched) continue
        const rtn = await run(session, ctx)
        if (!rtn) return
        return rtn.toString()
      }
      return next()
    })
    const resp2 = ctx.command('responder2').alias('resp2').usage('可以在配置里写函数的应答器')
    resp2.subcommand('.test <reallyLongString:text>')
      .usage('测试responder2语法是否合法')
      .example('resp2.test $ -> true -> "ok!"')
      .action((_, syntax) => {
        try {
          const parsed = parser.parse(syntax)
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
          const transformNames = (ip) => {
            const {names, inline, async: isAsync, code } = ip
            let rtn = `${isAsync ? '[async]' : ''} ${inline ? '[inline]' : ''} \n`
            rtn += `${isAsync ? '|| async ' : '|| '}`
            if (!names || (names && names.session && names.context)) {rtn += `(session, context) => ${inline ? code.trim() :'{' + code.trim() + '}'}`}
            else if (names.session && !names.context) {rtn += `session => ${inline ? code.trim() :'{' + code.trim() + '}'}`}
            return rtn
          }
          if (syntax === 'current') syntax = trigger
          const parsed = parser.parse(syntax)
          const rtn = []
          parsed.forEach((line, index) => {
            rtn.push(`[${index}]:`)
            if (Array.isArray(line)) { return rtn.push(`注释: ${line[1]}`)}
            const cond = line.cond
            const action = line.action
            if (['startsWith', 'includes'].includes(cond.type)) {
              rtn.push(`|| 触发条件:\n|| session.content.${cond.type}('${cond.content}')`)
            } else if (cond.type === 'equals') {
              let equals = cond.eq.split('eq').join('=')
              rtn.push(`|| 触发条件:\n|| session.content ${equals} '${cond.content}'`)
            } else if (cond.type === 'exec') {
              rtn.push(`|| 自定义触发函数: ${transformNames(cond)}`)
            }
            rtn.push('|| ⬇️')
            if (action.type === 'Literal') {
              rtn.push(`|| 固定回复:\n|| '${action.value}'`)
            } else if (action.type === 'exec') {
              rtn.push(`|| 自定义回复函数: ${transformNames(action)}`)
            }
            if (index < parsed.length - 1) {
            }
          })
          return rtn.join('\n')
        } catch (err) {
          return 'error when parsing:' + err.stack
        }
      })
  } catch (err) {
    ctx.logger('responder2').error(err)
  }
}
