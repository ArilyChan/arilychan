'use strict'

class Activity {
  constructor (seed, events) {
    this.seed = seed

    this.luck = events.luck
    this.mods = events.mods
    this.modsSpecial = events.modsSpecial
    this.activities = events.activities
  }

  getStatList () {
    const statList = {}
    // 随机吉凶
    statList.luck = this.getRandomArray(this.luck)
    // 随机mod
    statList.mod = this.getRandomArray(this.mods)
    // 如果够幸运还有特殊mod
    if (this.random(this.seed / 100, 100) <= 10) statList.specialMod = this.getRandomArray(this.modsSpecial)
    // 随机事件
    const numGood = this.random(this.seed / 9, 1611) % 2 + 1
    const numBad = this.random(this.seed / 6, 6266) % 2 + 1
    const randomActivities = this.getRandomArray(this.activities, numGood + numBad)
    statList.goodList = randomActivities.slice(0, numGood)
    statList.badList = randomActivities.slice(numGood)

    return statList
  }

  getRandomArray (array, size = 1) {
    const arrLength = array.length
    const temp = new Array(arrLength)
    for (let i = 0; i < arrLength; ++i) {
      temp[i] = i
    }

    const result = []
    for (let i = size; i > 0; --i) {
      let index = this.random(this.seed * i, temp.length) - 1
      if (index < 0) index = 0
      result.push(array[temp[index]])
      temp.splice(index, 1)
    }
    if (size === 1) return result[0]
    else return result
  }

  random (seed, max) { // int [1,max]
    seed = (seed * 9301 + 49297) % 233280
    return Math.ceil(seed / 233280.0 * max)
  }
}
module.exports = Activity
