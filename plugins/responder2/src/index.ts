import { Context, Schema } from 'koishi'
import { parser } from './grammar'
import { build as exec } from './runtime/builder'
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
  const matches = []
  try {
    const reader = parser.parse(trigger)
    reader.forEach((command, index) => {
      if (Array.isArray(command)) return
      if (command.type !== 'incomingMessage') return
      let matchRule
      const cond = command.cond
      switch (cond.type) {
        case 'startsWith':
          matchRule = (content) => content.startsWith(cond.content)
          break
        case 'includes':
          matchRule = (content) => content.includes(cond.content)
          break
        case 'equals':
          if (cond.eq === 'eqeqeq') matchRule = (content) => content === cond.content
          if (cond.eq === 'eqeq') matchRule = (content) => content == cond.content
          if (cond.eq === 'eq') {
            ctx.logger('responder2').warn(`got left assign in rules #${index}, auto-corret to double equal.`)
            matchRule = (content) => content == cond.content
          }
          break
        case 'exec':
          if (!cond.names) cond.names = {}
          matchRule = exec(cond.code, cond.names, {async: cond.async, inline: cond.inline})
      }
      const action = command.action
      let run
      switch (action.type) {
        case 'Literal':
          run = () => action.value
          break;
        case 'exec':
          if (!action.names) action.names = {}
          run = exec(action.code, action.names, {async: action.async, inline: action.inline})
      }
      matches.push([matchRule, run])
    })
    ctx.middleware(async (session, next) => {
      for (const [match, run] of matches) {
        const matched = match(session.content)
        if (!matched) continue
        const rtn = await run(session, ctx)
        if (!rtn) return
        return rtn.toString()
      }
      return next()
    })
  } catch (err) {
    ctx.logger('responder2').error(err)
  }
}
