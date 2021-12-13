const path = require('path')
const next = require('next')
let site = null
  const nextBuild = require('next/dist/build')
  // const nextExport = require('next/dist/server/export')
const rootPath = `${path.relative(process.cwd(), __dirname)}`

const nextBuild = require('next/dist/build')

module.exports.webView = async (options, storage, httpServer) => {
  if (site) return site
  if (!fs.existsSync(rootPath + '/.next')) {
    await nextBuild.default(path.resolve(rootPath), require('./next.config.js'))

const build = async () => {
  await nextBuild.default(path.resolve(rootPath), require('./next.config.js'))
}
const deleteCache = () => {
    // delete cache to reload .next
    const absRoot = path.resolve(rootPath + '/.next')
    Object.keys(require.cache).forEach(r => {
        if (r.startsWith(absRoot))
        delete require.cache[r]
    })
}
const prep = async (options) => {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({
    dev,
    conf: { distDir: `${path.relative(process.cwd(), __dirname)}/.next` }
  })
  const handle = app.getRequestHandler()
  try {
    await app.prepare()
  } catch (error) {
    await build()
    return prep(options) 
  }
  return handle
}

module.exports.webView = async (options, storage, httpServer) => {
  if (site) return site
  const handle = await prep(options)
  deleteCache()
  site = handle

  return await handle
}
