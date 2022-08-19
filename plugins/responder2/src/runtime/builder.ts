import { Variable } from '../'
export interface BuilderOptions {
  async: boolean
  inline: boolean
  isMatcher?: boolean
  isAction?: boolean
}

export const rebuildVariableString = (variable: Variable) => {
  if (typeof variable === 'string') return variable
  else if (variable.type === 'array-destructuring') {
    return `[ ${variable.variables.map(rebuildVariableString).join(', ')} ]`
  } else if (variable.type === 'object-destructuring') {
    return `{ ${variable.variables.map(rebuildVariableString).join(', ')} }`
  } else if (variable.type === 'rename') {
    return `${variable.from}: ${variable.to}`
  }
}

export function build (code: string, variables: Variable[], options: BuilderOptions) {
  let Constructor = Function
  const { async, isMatcher, isAction } = options
  if (async) {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    Constructor = AsyncFunction
  }
  if (options.inline) code = `return ${code}`
  if (!variables.length && isMatcher) return new Constructor('session', 'context', 'resolve', 'reject', code)
  else if (!variables.length && isAction) return new Constructor('session', 'context', 'returnedValue', code)
  // TODO: support destructuring
  const returnValue = Constructor(...variables.map(rebuildVariableString), code)
  console.log(returnValue)
  return returnValue
}
