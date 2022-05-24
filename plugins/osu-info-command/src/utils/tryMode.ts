import { Options } from '../index'
export default function TryMode (options: Options) {
  const defaultServer = Object.entries(options.server).find(([server, conf]) => conf.default)?.[0]
  // eslint-disable-next-line no-unused-vars
  const validateOP = (op, session) => {
    if (!op.server) op.server = session.user?.osu?.defaultServer || defaultServer
    const server = op.server
    if (!op.mode) op.mode = session.user?.osu?.[server]?.mode // || options.server?.[server].mode[0]
    if (!options.server[server]) throw new Error(['Invalid server:', server].join(' '))
    if (!op.mode) return op
    if (!options.server[server].mode.includes(op.mode)) throw new Error(['Invalid mode on server:', op.server, 'with mode:', op.mode].join(' '))
    return op
  }

  const transformModeOP = (op) => {
    if (!op.mode) return op
    Object.entries(options.modeAlias)
      .some(([to, alias]: [to: string, alias: string[]]) => {
        if (!alias.includes(op.mode.toLowerCase())) return false
        op.mode = to
        return true
      })
    return op
  }

  const transformMode = (mode) => {
    if (!mode) return mode
    Object.entries(options.modeAlias)
      .some(([to, alias]: [to: string, alias: string[]]) => {
        if (!alias.includes(mode.toLowerCase())) return false
        mode = to
        return true
      })
    return mode
  }

  return {
    validateOP,
    transformModeOP,
    transformMode,
    validateMode (mode, server) {
      if (!mode) return mode
      if (!options.server[server]) throw new Error(['Invalid server:', server].join(' '))
      if (!options.server[server].mode.includes(mode)) throw new Error(['Invalid mode on server:', server, 'with mode:', mode].join(' '))
      return mode
    }
  }
}
