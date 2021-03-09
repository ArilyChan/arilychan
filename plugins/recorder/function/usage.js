module.exports = async (storage) => {
  const message = storage.messages
  if (!storage.inited) return {}
  const array = await message.find().toArray()
  const result = array.reduce((acc, message) => {
    const { triggerCount, groupCount, commandTriggerHourSummary } = acc
    const command = message.message.split(' ')
    if (command[0].startsWith('[')) command.slice(1)
    const first = command[0]
    // const user = message.userId || -1
    const group = message.groupId || -1
    const time = new Date(message.time * 1000)
    const hour = time.getHours()

    if (!triggerCount[first]) triggerCount[first] = 0
    triggerCount[first] += 1

    // if (!userCount[user]) userCount[user] = 0
    // userCount[user] += 1

    if (!groupCount[group]) groupCount[group] = 0
    groupCount[group] += 1

    // if (!userTriggerHourSummary[user]) userTriggerHourSummary[user] = []
    // if (!userTriggerHourSummary[user][hour]) userTriggerHourSummary[user][hour] = 0
    // userTriggerHourSummary[user][hour] += 1

    if (!commandTriggerHourSummary[first]) commandTriggerHourSummary[first] = []
    if (!commandTriggerHourSummary[first][hour]) commandTriggerHourSummary[first][hour] = 0
    commandTriggerHourSummary[first][hour] += 1

    // if (!userTriggerCount[user]) userTriggerCount[user] = {}
    // if (!userTriggerCount[user][first]) userTriggerCount[user][first] = 0
    // userTriggerCount[user][first] += 1
    return acc
  }, {
    triggerCount: {},
    // userCount: {},
    groupCount: {},
    // userTriggerCount: {},
    // userTriggerHourSummary: {},
    commandTriggerHourSummary: {}
  })
  return result
}
