'use strict'
const XorShift = require('xorshift').constructor
const seedrandom = require('seedrandom')
const shuffleSeed = require('shuffle-seed')

class Activity {
  constructor (qqId = 'unknown', events, day = new Date()) {
    this.qq = qqId.toString()
    this.today = day
    // this.iday = (this.today.getFullYear() * 10000 + (this.today.getMonth() + 1) * 100 + this.today.getDate()).toString()
    // this.seed = Math.ceil(seedrandom(this.qq + this.iday)() * 1000000)
    this.seed = Math.ceil(seedrandom(this.qq)() * 1000000)
    // this.rng = new XorShift([this.seed, 0, 1, 0])
    // this.rng.random() // 第一次随机数一般不怎么随机，取后续随机数
    this.luck = events.luck
    this.mods = events.mods
    this.modsSpecial = events.modsSpecial
    this.activities = events.activities
  }

  get rng () {
    const startOfToday = new Date(this.today)
    startOfToday.setUTCHours(0, 0, 0, 0)
    const gen = new XorShift([startOfToday.getTime(), this.seed, 2, 0])
    gen.random()
    return gen
  }

  get result () {
    const statList = {}
    // 随机吉凶
    statList.luck = this.getRandomArray(this.luck)
    // 随机mod
    statList.mod = this.getRandomArray(this.mods)
    // 如果够幸运还有特殊mod
    if (this.rng.random() <= 0.1) statList.specialMod = this.getRandomArray(this.modsSpecial)
    // 随机事件
    const randomActivities = this.getRandomArray(this.activities, 4)
    statList.goodList = randomActivities.slice(0, 2)
    statList.badList = randomActivities.slice(2)

    return statList
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
module.exports = Activity
