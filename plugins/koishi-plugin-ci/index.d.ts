export type BuildingFunction = CallableFunction | Promise<CallableFunction>
export type BuildResult = {
  job: String,
  successed: Boolean,
  finished: Boolean,
  error?: Error
}
declare module 'koishi' {
  namespace Context {
    namespace ci {
      interface Build {
        handlers?: Map<String, Array<BuildingFunction>>
  
        use(builderFunction: BuildingFunction):  void
        run({ only, except }: { only?: Array<Plugin>, except?: Array<Plugin> }):  Promise<BuildResult[]>
      }
      interface VersionControl {
        handlers?: Map<String, Array<{
          check: () => {
            current: any,
            latest: any,
            hasUpdate: Boolean,
          },
          update: CallableFunction
        }>>
  
        use(builderFunction: BuildingFunction): void
        run({ only, except }: { only?: Array<Plugin>, except?: Array<Plugin> }): Promise<BuildResult[]>
      }
    }
    interface ci {
      getPluginState: (plugin: Plugin) => Plugin.State
      getStateRoot: (state: Plugin.State) => Plugin.State

      build: ci.Build
    }
  }
}