const config = require('../config/adapters/onebot.js')
module.exports = (koishi) => koishi.plugin('adapter-onebot', config)
