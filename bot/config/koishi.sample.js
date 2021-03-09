let logLevel
if (process.env.NODE_ENV !== 'production') logLevel = 3
module.exports = {
  port: 7070,
  bots: [{
    type: 'cqhttp:ws',
    server: 'http://localhost:6700',
    name: '小阿日',
    commandPrefix: ['!', '！'],
    logLevel
  }]
}
