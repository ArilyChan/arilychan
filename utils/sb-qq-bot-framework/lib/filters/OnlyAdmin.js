module.exports = ({ postType, messageType, sender: { role } }, storage) => {
  return ['owner', 'admin'].includes(role)
}
