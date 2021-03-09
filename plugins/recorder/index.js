const Storage = require('./storage')
const web = require('./server')
let webInited = false
let storage

// 在 a.js, b.js 中编写两个不同的插件
const recorder = require('./recorder')
const slipper = require('./slipper')

// 将这两个插件输出
module.exports.recorder = recorder
module.exports.slipper = slipper
module.exports.Storage = Storage
module.exports.init = (options) => {
  if (!storage) storage = new Storage(options)
  return storage
}
module.exports.webView = (options, storage) => {
  if (webInited) return undefined
  webInited = true
  return web(storage)
}

module.exports.name = 'message-recorder'
// 在 apply 函数中安装 a, b 两个插件
// module.exports.apply = (ctx, options = null,storage) => {
//     // let storage = options.storage;
//     if (!storage) storage = new Storage();
//     ctx.plugin(recorder, storage)
//     ctx.plugin(slipper, storage)
// }
module.exports.apply = () => console.warn('this is not how you should use this plugin.')
