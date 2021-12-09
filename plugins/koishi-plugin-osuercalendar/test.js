'use strict'

const run = require('./run')
const fsP = require('fs').promises
const eventPath = './osuercalendar-events.json'

// 模拟meta
class Meta {
  constructor (userId) {
    this.userId = userId
  }

  send (mes) {
    console.log(mes + '\n')
  }
}

console.log('你的QQ号是1了')

let meta = new Meta('1')

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
rl.on('line', (line) => {
  if (line.startsWith('qq')) {
    const myQQ = line.substring(2)
    meta = new Meta(myQQ)
    console.log('你的QQ号是' + myQQ + '了')
  } else if (line === 'period') console.log(period(meta.userId))
  else run.koishiHandler(meta, eventPath, new Date())
})

async function period (id) {
  const { Fortune } = run
  const start = new Date()
  start.setDate(start.getDate() - 10)
  const end = new Date()
  end.setDate(end.getDate() + 10)
  const json = await fsP.readFile(eventPath)
  const events = JSON.parse(json)

  const fortuneTeller = new Fortune(events).bind(id)
  const result = fortuneTeller.from(start).to(end)
  console.log(result.map(r => r.result))
}
