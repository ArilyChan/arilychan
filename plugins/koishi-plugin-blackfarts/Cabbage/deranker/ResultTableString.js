const { readAllCachedUser } = require('./common.js')
async function showResult () {
  const results = await readAllCachedUser()
  // let players = [

  // ];
  // let results = await Promise.all(players.map(user => calcUser(user)));
  results.sort((a, b) => (b.overrankingPPPercentage + b.derankingPPPercentage) - (a.overrankingPPPercentage + a.derankingPPPercentage))
  const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length

  function middle (array) {
    const args = array
    args.sort() // 排序
    if (args.length % 2 === 0) { // 判断数字个数是奇数还是偶数
      return ((args[args.length / 2] + args[args.length / 2 - 1]) / 2) // 偶数个取中间两个数的平均数
    } else {
      return args[parseInt(args.length / 2)] // 奇数个取最中间那个数
    }
  }
  const avg = average(results.map(b => (b.overrankingPPPercentage + b.derankingPPPercentage)).filter(b => +b))
  console.log('average overrank percentage', `${Math.round(avg * 10000) / 100}%`)
  console.log('overall rank (average overranking offsetted)')
  console.table(results.reduce((acc, { name, overrankingPPDelta, derankingPPDelta, overrankingPPPercentage, derankingPPPercentage, now, overrankingPP }, index) => {
    acc[`#${index + 1}`] = {
      // rank: index + 1,
      name,
      overranking: `${Math.round((overrankingPPPercentage - avg + derankingPPPercentage) * 10000) / 100}%`,
      pp: Math.round(now * 100) / 100,
      overrankDelta: Math.round(overrankingPPDelta * 100) / 100,
      derankDelta: Math.round(derankingPPDelta * 100) / 100
    }
    return acc
  }, {}))
}
showResult()
