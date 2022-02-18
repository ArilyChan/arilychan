const config = require('../config/adapters/onebot-2')
module.exports = (koishi) => koishi.plugin('adapter-onebot', config)
