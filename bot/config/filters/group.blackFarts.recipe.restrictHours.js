const recipeFilter = require('./group.blackFarts.recipe')

const userTimezone = new Map()

const isRestrictedTime = function (restricedHours, offset = 0) {
  const now = new Date()
  const hour = now.getHours() + offset

  if (restricedHours.some(({ from, to }) => hour >= from && hour < to)) return true
  return false
}
const setUserTimezone = function (userId, currentHour) {
  const now = new Date()
  const hour = now.getHours()
  userTimezone.set(userId, currentHour - hour)
}
module.exports = (restrict, ...groups) => {
  return meta => recipeFilter(...groups)(meta).then(result => {
    // if user is setting the timezone
    if (isRestrictedTime(restrict) && meta.message.startsWith('我这现在')) {
      const firstNumber = meta.$parsed.message.match(/\d+/)[0]
      if (firstNumber) {
        setUserTimezone(meta.userId, firstNumber)
        meta.$send('好,再试试吧').catch(e => console.error.bind(console))
        return false
      }
      meta.$send('收到了消息但是没找到时间').catch(e => console.error.bind(console))
    }

    // allow if not related to this filter
    if (result) return result

    // allow if not in restriced times
    if (!isRestrictedTime(restrict)) return true

    // allow baesd on user's timezone
    if (userTimezone.has(meta.userId)) {
      if (!isRestrictedTime(restrict, userTimezone.get(meta.userId))) return true
    }

    // default: deny all
    meta.$send('现在爆炸不让吃...要不要去菜品群吃? 加%㪊 1097526643\n或者告诉我你那里几点了? \n发送“我这现在12点 (24小时制的小时)”来让小阿日通过你的时区限制饭点.(小阿日不会记住你的偏好)')
      .catch(e => console.error.bind(console))
    return false
  })
}
