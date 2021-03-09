function CabbageReaction (reaction, storage) {
  this.reaction = reaction
  this.storage = storage
}

CabbageReaction.prototype.reactTo = function (reaction) {
  if (this.reaction[reaction.action] === undefined) return false

  const action = this.reaction[reaction.action]
  this.actionRecursive(action, reaction)
  return true
}

CabbageReaction.prototype.actionRecursive = async function (action, reaction) {
  if (action instanceof Function) {
    await action(reaction)
  } else if (typeof action === 'string') {
    await reaction.meta.$send(action).catch(e => console.error.bind(console))
  } else if (action instanceof Array) {
    await Promise.all(action.map(sub => this.actionRecursive(sub, reaction)))
  }
}

module.exports = CabbageReaction
