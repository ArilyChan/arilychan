const path = require('path')
const url = require('url')
const next = require('next')

const express = require('express')
const router = express.Router()

let site = null

const nextBuild = require('next/dist/build')
const build = async (options) => {
    await nextBuild.default(__dirname, {...require('./next.config.js'), basePath: options.web.prefix})
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
  // const { dev } = options
  // const distDir = magic()
  // const distDir = path.join(__dirname, './.next')
  const app = next({
    dev: true,
    dir: path.relative(process.cwd(), __dirname),
    conf: {
      distDir: path.relative(process.cwd(),path.join(__dirname, '/.next')),
      // dir: path.relative(process.cwd(),path.join(__dirname)),
      basePath: options.web.prefix,
      serverRuntimeConfig: {
        manual: require('sb-bot-manual'), 
        additional: {
          hi: 'hi'
        }
      }
    }
  })
  const handle = app.getRequestHandler()
  try {
    deleteCache()
    await app.prepare()
  } catch (error) {
    console.error(error)
    if (doNotBuild){
      throw new Error('you need to build.')
    }
    await build(options)
    deleteCache()
    return prep(options, true) 
  }
  return handle
}
exports.build = build
module.exports.web = async (options) => {
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
