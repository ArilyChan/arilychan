const path = require('path')
const fs = require('fs')


const next = require('next')
let site = null
  const nextBuild = require('next/dist/build')
  // const nextExport = require('next/dist/server/export')
// console.log(`${path.relative(process.cwd(), __dirname)}/.next`)
const rootPath = `${path.relative(process.cwd(), __dirname)}`


module.exports.webView = async (options, storage, httpServer) => {
  if (site) return site
  if (!fs.existsSync(rootPath + '/.next')) {
    await nextBuild.default(path.resolve(rootPath), require('./next.config.js'))

    // delete cache to reload .next
    const absRoot = path.resolve(rootPath) + '/.next'
    Object.keys(require.cache).forEach(r => {
        if (r.startsWith(absRoot))
        delete require.cache[r]
    })
  }
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({
    dev,
    conf: { distDir: `${path.relative(process.cwd(), __dirname)}/.next` }
  })
  const handle = app.getRequestHandler()
  await app.prepare()
  site = handle

  return await handle
}