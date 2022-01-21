export type builderFunction = CallableFunction | Promise<CallableFunction>
declare module 'koishi' {
  namespace Context {
    interface ci {
      builders?: Array<builderFunction>
    }
    type useBuild = (builderFunction: builderFunction) => void
    type build = () => Promise<void>
  }
}