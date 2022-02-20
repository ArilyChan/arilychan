# Koishi Plugin CI
程序化部署您的插件

比如：可以通过插件的参数动态构建前端

## 安装
```bash
npm install koishi-plugin-ci
```
```javascript
const { App } = require('koishi')
const app = new App()

app.plugin('koishi-plugin-ci')
// ...
```
## 功能
### 构建
`plugin-that-requires-build.js`
```javascript
const fs = require('fs').promises
const existsSync = require('fs').existsSync

module.exports = {
  apply(ctx, opt) {
    ctx.using(['ci'], ({ ci }) => {
      ci.build.use(() => {
        const buildPath = path.resolve(path.join(__dirname, '.build'))
        if (existsSync(buildPath)) await fs.rm(buildPath, {recursive: true})
        await fs.mkdir(buildPath)
        await fs.writeFile(path.join(buildPath, "build.json"), JSON.stringify(opt.buildOpt))
        ctx.logger('ci').info('plugin-that-requiring-build: build finished')
      })
    })
  }
}
```
`build.js`
```javascript
const { App } = require('koishi')
const app = new App()
app.plugin('koishi-plugin-ci')
app.plugin('plugin-that-requires-build', { buildOpt: { buildTime: new Date() }})

app.ci.build.run()
  .then(() => process.exit(0))
```
这样便可在 `plugin-that-requires-build` 插件目录下构建 `.builds/build.json`
```json
{"buildTime":"2022-01-21T11:22:04.383Z"}
```

### API
#### 工具
##### KoishiCI.getPluginState(plugin) 
##### KoishiCI.getPluginState() 
返回已安装的插件或调用此函数的插件的State
##### KoishiCI.getStateRoot(state)
返回嵌套中最上层的State

#### 构建相关功能
##### build.use(callback)
##### build.use(Promise\<callback\>)
注册构建函数
##### `async` build({only: [Plugin]})
##### `async` build({except: [Plugin]})
##### `async` build()
运行构建函数 [build示例](#构建)

`build-only-some-plugins.js`
```javascript
// ...
app.ci.build.run({only: ['plugin-that-requires-build']})
```
只会构建 `plugin-that-requires-build` 插件

`build-except-some-plugins.js`
```javascript
// ...
app.ci.build.run({except: ['plugin-that-requires-build']})
```
会跳过构建 `plugin-that-requires-build` 插件