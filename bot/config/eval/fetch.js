const { context } = require('koishi-plugin-eval/dist/worker')
// fetch = require('node-fetch')
// console.log({config, context, internal})
context.fetch = require('node-fetch')
