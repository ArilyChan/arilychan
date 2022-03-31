const [Score, Beatmap, Result] = ['Score', 'Beatmap', 'Result'].map(obj => require(`./Objects/${obj}.js`))
const fetch = require('node-fetch')
const utils = require('../../../utils/utils.js')
const fs = require('fs').promises
const fsold = require('fs')

const memorize = require('memorize')

function Deranker () {

}
Deranker.prototype.getScoreFresh = async function (user) {
  const pppolice_base = (username) => `https://o.ri.mk/api/pppolice/v1/BPrange/${username}/2007/2029`
  const score = await fetch(pppolice_base(user)).then(res => res.json()).catch(e => Promise.resolve([]))
  score.map(result => {
    result.__proto__ = Result.prototype
    result.beatmap.__proto__ = Beatmap.prototype
    result.newScore.__proto__ = Score.prototype
  })
  return score
}
Deranker.prototype.calculatePPChange = async function (user) {
  user.bp.sort((a, b) => b.pp - a.pp)
  const first100 = user.bp.slice(0, 100)

  const now = utils.calculateBP(user)

  const derankingBPBuffed = await Promise.all(first100.map((score) => {
    const result = score
    if (result.isDeranking()) {
      result.pp = result.withSO() ? (result.pp / 0.9) : result.pp
      result.pp = result.withNF() ? (result.pp / 0.9) : result.pp
    }
    // score.newScore.pp = result.pp;
    return result
  }))
  const derankingPP = utils.calculateBP({ bp: derankingBPBuffed })

  const overrankingBPNerfed = await Promise.all(user.bp.map(result => {
    const owpercent = result.newScore.getOverWeightPercentage()
    // console.log(owpercent,result.beatmap.toString())
    if (owpercent > 0 && !result.newScore.isDeranking()) {
      result.newScore.pp = result.newScore.pp * (1 - owpercent)
      if (result.newScore.pp < 0) result.newScore.pp = 0
    }
    return result
  }).map(result => result.newScore).sort((a, b) => b.pp - a.pp).slice(0, 100))
  const overrankingPP = utils.calculateBP({ id: user.id, bp: overrankingBPNerfed })

  return ({
    overrankingPP,
    derankingPP,
    now
  })
}
Deranker.prototype.getScore = async function (user) {
  try {
    const file = `${__dirname}/Datas/CachedResult/${user}.json`
    if (fsold.existsSync(file)) {
      // console.log('use cache:', user);
      const score = JSON.parse(await fs.readFile(file))
      if (score.length <= 0) throw 'calc'
      score.map(result => {
        result.__proto__ = Result.prototype
        result.beatmap.__proto__ = Beatmap.prototype
        result.newScore.__proto__ = Score.prototype
      })
      return score
    } else throw 'calc'
  } catch (e) {
    // console.log('fetch:', user);
    const result = await this.getScoreFresh(user)
    await fs.writeFile(`${__dirname}/Datas/CachedResult/${user}.json`, JSON.stringify(result))
    return result
  }
}
async function calcUser (user) {
  const a = new Deranker()
  const scores = await a.getScore(user)
  const result = await a.calculatePPChange({ name: user, bp: scores })
  return {
    name: user,
    // derankingCount: result.derankingScore.length,
    // overrankingCount: result.overrankingScore.length,
    // allCount: result.all.length,
    now: result.now,
    derankingPP: result.derankingPP,
    derankingPPDelta: result.now - result.derankingPP,
    derankingPPPercentage: (result.now - result.derankingPP) / result.now,
    overrankingPP: result.overrankingPP,
    overrankingPPDelta: result.now - result.overrankingPP,
    overrankingPPPercentage: (result.now - result.overrankingPP) / result.now
  }
  // console.log(`${user}: ${result.derankingScore.length}/${result.all.length} deranking score, ${result.overrankingScore.length}/${result.all.length} overranking score, ${utils.addPlus(Math.round((result.derankingPP - result.now) * 100) / 100 )}pp if no deranking, ${utils.addPlus(Math.round((result.overrankingPP - result.now) * 100) / 100 )}pp if no farming,  `)
}
async function rank () {
  let players = { t1: ['MyAngelMiku', 'Crystal', 'milk-tea', 'My Angel Anzu', 'davidqu2', 'Shiina Noriko', 'WadsyaName-', 'Sugiura Kanade', 'Imokora', 'NekoKamui', 'Hibikom', 'Dragons', 'Plum Blossoms', 'KuKu_QY'], t2: ['Garden', 'striFE36', 'Explosive', 'Tira', 'Aimseky', 'Refia Vridis', 'hakumo ai', 'Gyro Zeppeli', 'Pigeons', '[Kaffu Chile]', 'SnowNight', 'Hatsuki Yura', 'ichibannobaka', 'Nhato'], t3: ['Old K', 'ak74', 'silly me', '[-Agony-]', 'totoriott', 'Y u k i n a', 'SugiuraAyano', 'FujiwaraNoMokou', 'usao', '- Jelly -', 'hakumo shiro', 'VinyekK_Ame', 'wzw2001119', 'sakiyi'], t4: ['RE_CYCLC', 'Kishin Sagume', 'SadJoyful_DZ', 'Watera1', 'heisiban', 'MagicSquare834', 'Nagaiyume', 'zhuangsi', 'MyAngelsakiyi', '[ Gujiu ]', '[ Emiya ]', 'feifeiis', 'Shiori_suki', 'Lifcoach'] }
  players = Object.entries(players).reduce((acc, [b, user]) => {
    acc.push(...user)
    return acc
  }, [])
  const results = await Promise.all(players.map(async user => {
    	await fetch(`https://o.ri.mk/api/pppolice/v1/register/${user}`)
    	return calcUser(user)
  }))
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
  const avg = 0.04
  console.log('average overrank percentage', `${Math.round(avg * 10000) / 100}%`)
  console.log('overall rank (average overranking offsetted)')
  // strs = results.map(({ name, overrankingPPDelta, derankingPPDelta, overrankingPPPercentage, derankingPPPercentage }, index) => `${name}: #${index + 1}, ${Math.round((overrankingPPPercentage - avg + derankingPPPercentage ) * 10000) / 100}%, ${ Math.round(overrankingPPDelta)}, ${ Math.round(derankingPPDelta) }`);
  // strs.map(str => console.log(str));
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
  // `${name}: #${index + 1}, ${Math.round((overrankingPPPercentage - avg + derankingPPPercentage ) * 10000) / 100}%, ${ Math.round(overrankingPPDelta)}, ${ Math.round(derankingPPDelta) }`))
}
rank()
