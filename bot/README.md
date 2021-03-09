# qq-bot
 
## 安装
```javascript
cd qq-bot && npm install
```
复制并修改config/koishi.sample.js为config/koishi.js, 添加或修改需要的参数

## 添加插件
修改config/contextPlugin.js

### context builder
```javascript
const contextBuilder = require('sb-qq-bot-framework/lib/contextBuilder.js')
const appCtx = contextBuilder((app) => app, 'use app as context')
const userCtx = contextBuilder((app) => app.users, 'user context')
```

### plugins
```javascript
{
  type: 'node_module' || 'local',
  path: 'Path/to/plugin', // required when type is "local"
  require: 'my-commonJS-plugin', // required when type is "node_module"
  options: {}, // options for plugin. see options in koishi js
  priority: Number, // this is for plugin loader to sort the plugins. Sort by desending when priority >=0, ascending when priotity < 0.
  filter: Function || Array[Function], // function takes (meta, storage) as parameter, returning a boolean or a promise that resolves as boolean. 
  // when Array is given, it stop executing and filtering out the message if one of elements returns false or a promise resolves as false.
  prependFilter: Function || Array[Function], // same as filter. For prependMiddleware()
  webPath: String // for web views
}
```
#### filter
我们提供了一套方便快捷的API实现简洁的过滤功能
```javascript
const filters = require('sb-qq-bot-framework/lib/filters')
// ...
```

##### 使用方法
```javascript
  // blocklist example
  filter: [filter.blockGroup(123456788), filter.blockUser(10089), filter.blockGroupUser({
    123456789: [123456, 567890]
  })]
  // group 123456788, user 10089, 123456 and 567890 in group 123456789 will be blocked.
  
  // whitelist example
  filter: [filter.exclusiveGroup(123456788), filter.onlyAdmin]
  // only the owner or admins of group 123456788 will not be blocked
```

##### 链式调用
所有提供的filter均返回Promise, 所以你可以通过.then()来链式定义filter
```javascript
  filter: meta => filter.exclusiveGroup(123456788).then(result => result || meta.$parsed.message !== 'disable' )
  // only group 123456788 could send "disable" to plugin
```


### example
```javascript
const contextBuilder = require('sb-qq-bot-framework/lib/contextBuilder.js')
module.exports = [
  for: contextBuilder((app) => app, 'anyone'),
  use: [{
    type: 'node_module',
    require: 'my-plugin',
    priority: 1,
    filter: [filter.blockUser(123456788)]
  },{
    type: 'local',
    path: 'manage-plugin',
    priority: 99999,
    filter: [filter.exclusiveGroup(123456788), filter.onlyAdmin]
  }]
]
```

## web view 和 shared state
在koishi插件定义的基础上提供了扩展的api供您提供网页支持,以及通过shared state和网页共享数据

```javascript
// a plugin for sb-qq-bot-framework
module.exports.name = 'my-plugin'
module.exports.webPath = 'web'
module.exports.init = function(options) => Any // => initial shared state
module.exports.webView = function(options, storage) => Express // express web view instance, storage is the return value of init()
module.exports.apply = function(ctx, options, storage) // storage is the return value of init()
```
