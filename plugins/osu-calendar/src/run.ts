
import { Session } from 'koishi'
import Fortune from './lib/Fortune'
import { OsuCalendarEvents } from './types/store'

export { Fortune }

export async function koishiHandler (meta: Session, eventPath: string) {
  try {
    const qqId = meta.userId
    if (!qqId) throw new Error('requires userId')

    const events = require(eventPath) as OsuCalendarEvents

    const fortuneTeller = new Fortune(events).binding(qqId)

    const statList = fortuneTeller.today.result

    let output = ''
    // TODO rewrite cq at
    // if (meta.type === 'private') output += `[CQ:at,id=${qqId}]` + '\n'
    output = output + '今日运势：' + statList.luck + '\n'
    output = output + '今日mod：' + statList.mod
    if (statList.specialMod) output = output + ', ' + statList.specialMod + '（？\n'
    else output = output + '\n'
    statList.goodList.forEach((item) => {
      output = output + '宜：' + item.name + '\n\t' + item.good + '\n'
    })
    statList.badList.forEach((item) => {
      output = output + '忌：' + item.name + '\n\t' + item.bad + '\n'
    })
    return output
  } catch (ex) {
    console.error(ex)
    return '一些不好的事情发生了'
  }
}
