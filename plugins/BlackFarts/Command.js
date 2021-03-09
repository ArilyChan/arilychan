function Command ({ meta, storage }) {
  this.meta = meta
  this.command = meta.message.substring(1).trim().split(' ')
  this.action = this.command[0].toLowerCase()
  this.storage = storage
}
module.exports = Command
