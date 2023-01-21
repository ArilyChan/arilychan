'use strict'

const run = require('./run')
const eventPath = './osu-calendar-events.json'

// 模拟meta
class Meta {
  constructor (userId) {
    this.userId = userId
  }

  send (mes) {
    console.log(mes + '\n')
  }
}

const meta = new Meta('1234567890')
const meta1 = new Meta('1345678902')
const meta2 = new Meta('2456782427')
let date = new Date()
for (let i = 0; i < 10; i++) {
  run(meta, eventPath, date)
  run(meta1, eventPath, date)
  run(meta2, eventPath, date)
  date = new Date(date.setDate(date.getDate() + 1))
}
