module.exports = (stream) => {
  const data = JSON.parse(stream)
  return {
    channelId: data.channelId || '#undefined',
    content: data.content || '',
    sender: {
      id: data.sender ? data.sender.id : ''
    }
  }
}
