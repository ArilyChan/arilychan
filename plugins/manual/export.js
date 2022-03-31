const { Builder, Nuxt } = require('nuxt')
const config = require('./nuxt.config.js')

const express = require('express')

const init = async (options) => {
  // const isDev = options.dev
  const isDev = true
  const nuxt = new Nuxt({dev: isDev, ...config})
  return nuxt
}
exports.build = async (nuxt) => {
  const builder = new Builder(nuxt)
  builder.build()
}
exports.web = async (options) => {
  const isDev = true
  const nuxt = await init(options)
  const router = express.Router()
  
  if (isDev) {
    exports.build(nuxt)
  }
  router.use(nuxt.render)
  return router
}
