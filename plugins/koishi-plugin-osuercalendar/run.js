'use strict'

const Activity = require('./Activity')
const fs = require('fs')
const fsP = require('fs').promises

class Fortune {
  constructor (events = {}) {
    this.events = events
  }

  bind (who) {
    return new FortuneBinding(who, this)
  }
}

class FortuneBinding {
  constructor (me, fortune) {
    this.me = me
    this.fortune = fortune
  }

  when (date) {
    date = new Date(date) // de-bind the date from
    date.setUTCHours(0, 0, 0, 0)
    return new Activity(this.me, this.fortune.events, date)
  }

  get today () {
    return this.when(new Date())
  }

  from (from) {
    const getDaysArray = function (s, e) { for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)) } return a }
    from = new Date(from) // de-bind the date from
    from.setUTCHours(0, 0, 0, 0)
    const self = this
    return new (class FortuneBindingPeriodCursor {
      to (to) {
        to = new Date(to)
        to.setUTCHours(0, 0, 0, 0)
        return getDaysArray(from, to).map(date => self.when(date))
      }
    })()
  }
}

async function koishiHandler (meta, eventPath, day) {
  try {
    const qqId = meta.userId
    if (!qqId) throw new Error('meta.userId is required')

    const json = await fsP.readFile(eventPath)
    const events = JSON.parse(json)

    const fortuneTelling = new Fortune(events)

    const fortuneTeller = new FortuneBinding(qqId, fortuneTelling)
    const activity = fortuneTeller.today

    // fs.readFile(eventPath, async (err, data) => {
    //   if (err) {
    //     console.log(err)
    //     return await meta.send('一些不好的事情发生了')
    //   }
    //   const events = JSON.parse(data.toString())
    //   const activity = new Activity(qqId, events, day)
    const statList = activity.getStatList()
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

module.exports = { koishiHandler, Fortune, FortuneBinding }
