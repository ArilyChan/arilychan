const { Bot } = require('koishi-core')
const { io } = require('./server')

Bot.prototype.sendGroupMsg = async function (groupId, message, autoEscape = false) {
  if (!message) return
  const session = this.createSession('group', 'group', groupId, message)
  if (this.app.bail(session, 'before-send', session)) return
  io.to(groupId).emit('client-message', {
    room: groupId,
    userId: 'server',
    message
  })
  // const { messageId } = await this.get('send_group_msg', { groupId, message: session.content, autoEscape })
  // session.contentId = messageId
  this.app.emit(session, 'send', session)
  return -1
}

Bot.prototype.sendGroupMsgAsync = function (...args) {
  return this.sendGroupMsg(...args)
}

Bot.prototype.sendPrivateMsg = async function (userId, message, autoEscape = false) {
  if (!message) return
  const session = this.createSession('private', 'user', userId, message)
  if (this.app.bail(session, 'before-send', session)) return
  io.to(userId).emit('client-message', {
    room: userId,
    userId: 'server',
    message
  })
  this.app.emit(session, 'send', session)
  return -1
}

Bot.prototype.sendPrivateMsgAsync = function (...args) {
  return this.sendPrivateMsg(...args)
}
