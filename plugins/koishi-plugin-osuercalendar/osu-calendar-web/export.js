const path = require('path')
const url = require('url')
const next = require('next')

const express = require('express')
const router = express.Router()

let site = null

const nextBuild = require('next/dist/build')
const build = async () => {
    await nextBuild.default(__dirname, require('./next.config.js'))
    return {
      job: 'build-nextjs',
      successed: true
    }
}

const deleteCache = () => {
    // delete cache to reload .next
    const absRoot = path.join(__dirname , '.next')
    Object.keys(require.cache).forEach(r => {
      if (r.startsWith(absRoot)) { 
        delete require.cache[r] }
    })
}
const prep = async (options, doNotBuild = true) => {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({
    dev,
    conf: {
      distDir: path.join(__dirname, '.next'),
      basePath: options.basePath || '/fortune',
      serverRuntimeConfig: {
        fortunePath: options.eventFile || path.join(__dirname, '../osuercalendar-events.json')
      }
    }
  })
  const handle = app.getRequestHandler()
  try {
    await app.prepare()
  } catch (error) {
    console.error(error)
    if (doNotBuild){
      throw new Error('you need to build. koishi-plugin-ci required')
    }
    await build()
    deleteCache()
    return prep(options, true) 
  }
  return handle
}
exports.build = build
module.exports.webApp = async (options, storage, httpServer) => {
  if (site) return site
  const handle = await prep(options)
  deleteCache()
  site = handle 
  router.use(express.static('.next'))
  router.use((req, res, next)=>{
    req.url = req.originalUrl
    return site(req, res)
  })
  return router
}
