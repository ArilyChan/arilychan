module.exports = {
  type: 'cqhttp:ws',
  port: 7070,
  server: 'http://localhost:6700',
  name: '小阿日',
  commandPrefix: ['!', '！'],
  logFilter: {
    CabbageReaction: 3
  }
  // selfId: 1840567854
  // 在这里加上其他配置信息
}
