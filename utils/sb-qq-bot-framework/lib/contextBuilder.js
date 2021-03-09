class Context {
  constructor (fn, description) {
    this.fn = fn
    this.description = description
  }

  getContextFromCtx (ctx) {
    return this.fn(ctx)
  }
}

function contextBuilder (fn, description = null) {
  return new Context(fn, description)
}

module.exports = contextBuilder
