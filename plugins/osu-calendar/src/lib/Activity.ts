import { OsuCalendarEvents } from '../types/store'
import random from 'seedrandom'
import shuffleSeed from 'shuffle-seed'
import { XorShift } from 'xorshift'

class FortuneDailyResult {
  seedString: string
  today: Date
  seed: number
  luck: unknown
  mods: unknown
  modsSpecial: unknown
  activities: unknown
  rng: XorShift

  constructor (qqId = 'unknown', events: OsuCalendarEvents, day = new Date()) {
    this.seedString = qqId.toString()
    this.today = day
    this.seed = Math.ceil(random(this.seedString)() * 1000000)
    this.luck = events.luck
    this.mods = events.mods
    this.modsSpecial = events.modsSpecial
    this.activities = events.activities

    // create random generator
    const startOfToday = new Date(day)
    startOfToday.setUTCHours(0, 0, 0, 0)
    const gen = new XorShift([startOfToday.getTime(), this.seed, 2, 0])

    gen.random() // 第一次随机数一般不怎么随机，取后续随机数
    this.rng = gen
  }

  get result () {
    // 随机事件
    const randomActivities = this.getRandomArray(this.activities, 4)

    return {
      date: this.today,
      // 随机吉凶
      luck: this.getRandomArray(this.luck),
      // 随机mod
      mod: this.getRandomArray(this.mods),
      // 如果够幸运还有特殊mod
      specialMod: (this.rng.random() <= 0.15) ? this.getRandomArray(this.modsSpecial) : undefined,
      goodList: randomActivities.slice(0, 2),
      badList: randomActivities.slice(2)
    }
  }

  getStatList () {
    return this.result
  }

  getRandomArray (array, size = 1) {
    const resp = shuffleSeed.shuffle(array, this.rng.random())
    if (size === 1) return resp[0]
    else return resp.slice(0, size)
  }
}
export default FortuneDailyResult
