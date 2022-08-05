export function build (code, names, options) {
  let Constructor = Function
  if (options.async) {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    Constructor = AsyncFunction
  }
  if (options.inline) code = `return ${code}`
  if (names.session && !names.context) return new Constructor(names.session, code)
  if (names.session && names.context) return new Constructor(names.session, names.context, code)
  if (names.session === false && names.context === false) return new Constructor(code)
  return new Constructor('session', 'context', code)
}
