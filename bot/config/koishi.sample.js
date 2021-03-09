let logLevel
if (process.env.NODE_ENV !== 'production') logLevel = 0
module.exports = [{
  type: 'cqhttp:ws',
  port: 7070,
  server: 'http://localhost:6700',
  name: '小阿日',
  commandPrefix: ['!', '！'],
  logFilter: {
    CabbageReaction: 3
  },
  logLevel
}]
