'use strict'

// const fs = require('fs')
// const fsP = require('fs').promises

const Fortune = require('./lib/Fortune')
// const Activity = require('./lib/Activity')
// const fs = require('fs')

async function koishiHandler (meta, eventPath, day) {
  try {
    const qqId = meta.userId
    if (!qqId) throw new Error('meta.userId is required')

    // const json = await fsP.readFile(eventPath)
    // const events = JSON.parse(json)
    const events = require(eventPath)

    // const fortuneTelling = new Fortune(events)

    const fortuneTeller = new Fortune(events).binding(qqId)
    const activity = fortuneTeller.today

    // fs.readFile(eventPath, async (err, data) => {
    //   if (err) {
    //     console.log(err)
    //     return await meta.send('一些不好的事情发生了')
    //   }
    //   const events = JSON.parse(data.toString())
    //   const activity = new Activity(qqId, events, day)
    const statList = activity.result
    let output = `[CQ:at,id=${qqId}]` + '\n'
    output = output + '今日运势：' + statList.luck + '\n'
    output = output + '今日mod：' + statList.mod
    if (statList.specialMod) output = output + ', ' + statList.specialMod + '（？\n'
    else output = output + '\n'
    statList.goodList.map((item) => {
      output = output + '宜：' + item.name + '\n\t' + item.good + '\n'
    })
    statList.badList.map((item) => {
      output = output + '忌：' + item.name + '\n\t' + item.bad + '\n'
    })
    return await meta.send(output)
    // })
  } catch (ex) {
    console.log(ex)
    return await meta.send('一些不好的事情发生了')
  }
}

module.exports = { koishiHandler, Fortune }
