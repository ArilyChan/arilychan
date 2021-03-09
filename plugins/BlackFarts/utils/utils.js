const osu = require('node-osu')
const AbortController = require('abort-controller')
exports.getOsuApi = () => {
  return new osu.Api('27caa4993a4430b2e63762bdd5e6b9643ddf7679')
}
exports.addPlus = (num) => {
  return (num > 0) ? `+${num}` : num
}
exports.timeoutSignal = (timeout = 5) => {
  const controller = new AbortController()
  const signal = controller.signal
  setTimeout(() => {
    controller.abort()
  }, timeout * 1000)
  return signal
}

exports.calculateBP = function (account, limit = 100) {
  let totalpp = 0
  account.bp.sort((a, b) => b.pp - a.pp)
  const bp = account.bp.slice(0, limit)
  bp.map((bp, index) => {
    const weight = Math.pow(0.95, index)
    const weightedpp = bp.pp * weight
    totalpp += weightedpp
  })
  return totalpp
}
