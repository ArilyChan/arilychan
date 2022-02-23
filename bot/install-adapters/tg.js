const config = require('../config/adapters/tg')
module.exports = (koishi) => koishi.plugin('@koishijs/plugin-adapter-telegram', config)
