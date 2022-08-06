export function build (code, names, options) {
  let Constructor = Function
  const { async, isMatcher, isAction } = options
  if (async) {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    Constructor = AsyncFunction
  }
  if (options.inline) code = `return ${code}`
  if (!names.length && isMatcher) return new Constructor('session', 'context', 'resolve', 'reject', code)
  else if (!names.length && isAction) return new Constructor('session', 'context', 'returnedValue', code)
  return new Constructor(...names, code)
  // if (names.session && !names.context) return new Constructor(names.session, code)
  // if (names.session && names.context) return new Constructor(names.session, names.context, code)
  // if (names.session === false && names.context === false) return new Constructor(code)
  // return new Constructor('session', 'context', code)
}
