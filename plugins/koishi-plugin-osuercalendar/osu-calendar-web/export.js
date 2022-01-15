const path = require('path')
const next = require('next')

const router = require('express').Router()

const nextBuild = require('next/dist/build')

const rootPath = `${path.relative(process.cwd(), __dirname)}`
let site = null

const build = async () => {
  await nextBuild.default(path.resolve(rootPath), require('./next.config.js'))
}
const deleteCache = () => {
    // delete cache to reload .next
    const absRoot = path.resolve(rootPath + '/.next')
    Object.keys(require.cache).forEach(r => {
      if (r.startsWith(absRoot)) { 
        delete require.cache[r] }
    })
}
const prep = async (options) => {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({
    dev,
    conf: {
      distDir: path.join(rootPath, '.next'),
      basePath: '/fortune',
      serverRuntimeConfig: {
        fortunePath: options.eventFile || path.join(rootPath, './osuercalendar-events.json')
      }
    }
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

module.exports.webApp = async (options, storage, httpServer) => {
  if (site) return site
  const handle = await prep(options)
  deleteCache()
  site = await handle 

  // return await handle

  router.use(site)
  return router
}
