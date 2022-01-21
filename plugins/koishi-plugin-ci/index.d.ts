export type BuildingFunction = CallableFunction | Promise<CallableFunction>
declare module 'koishi' {
  namespace Context {
    interface ci {
      builders?: Map<String, Array<BuildingFunction>>
      getState: (plugin: Plugin) => Plugin.State
      getStateRoot: (state: Plugin.State) => Plugin.State

      useBuild: (builderFunction: BuildingFunction) => void
      build: ({ only, except }: { only?: Array<Plugin>, except?: Array<Plugin> }) => Promise<void>
    }
  }
}