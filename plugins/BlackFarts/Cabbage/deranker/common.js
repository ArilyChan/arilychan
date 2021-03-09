const [Score, Beatmap, Result] = ['Score', 'Beatmap', 'Result'].map(obj => require(`./Objects/${obj}.js`))
const fetch = require('node-fetch')
const utils = require('./utils.js')
const he = require('he')
const fs = require('fs').promises
const fsold = require('fs')
const path = require('path')
const glob = require('glob-promise')
const memorize = require('memorize')
const pEvent = require('p-event')
const { Worker } = require('worker_threads')

function Deranker () {

}
Deranker.prototype.getScoreFresh = async function (user) {
  const pppolice_base = (username) => `https://o.ri.mk/api/pppolice/v1/getUser/${user.id}`
  const result = await fetch(pppolice_base(user.id)).then(res => res.json()).catch(e => Promise.resolve([]))
  result.bp.map(score => {
    // score.__proto__ = Result.prototype;
    // result.beatmap.__proto__ = Beatmap.prototype;
    score.__proto__ = Score.prototype
    score.createModsArray()
  })
  return result
}
Deranker.prototype.calculatePPChange = async function (user) {
  user.bp.sort((a, b) => b.pp - a.pp)
  const first100 = user.bp.slice(0, 100)

  const now = utils.calculateBP(user)

  const derankingBPBuffed = await Promise.all(JSON.parse(JSON.stringify(first100)).map((score) => {
    score.__proto__ = Score.prototype
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
    const owpercent = result.getOverWeightPercentage()
    // console.log(owpercent,result.beatmap.toString())
    if (owpercent > 0 && !result.isDeranking()) {
      const pp = result.pp * (1 - Math.pow(owpercent, 0.8))
      if ((pp / result.pp) < 0.5) result.pp = result.pp * 0.5 - pp * 0.2
      else result.pp = pp
    }
    return result
  }).sort((a, b) => b.pp - a.pp).slice(0, 100))
  const overrankingPP = utils.calculateBP({ id: user.id, bp: overrankingBPNerfed })

  return ({
    overrankingPP,
    derankingPP,
    now
  })
}
Deranker.prototype.getScore = async function (user, forceUpdate = false) {
  try {
    if (forceUpdate) throw 'calc'
    const file = `${__dirname}/Datas/CachedResults/${user.id}.json`
    if (fsold.existsSync(file)) {
      // console.log('use cache:', user);
      const score = JSON.parse(await fs.readFile(file))
      score.bp.map(result => {
        // result.__proto__ = Result.prototype;
        // result.beatmap.__proto__ = Beatmap.prototype;
        result.__proto__ = Score.prototype
      })
      return score
    } else throw 'calc'
  } catch (e) {
    console.log(e)
    // console.log('fetch:', user);
    const result = await this.getScoreFresh(user)
    fs.writeFile(`${__dirname}/Datas/CachedResults/${user.id}.json`, JSON.stringify(result))
    return result
  }
}
async function calcUserFresh (user) {
  if (typeof parseInt(user.id) !== 'number') throw 'id is not number'
  const a = new Deranker()
  user = await a.getScore(user)
  // let result = await a.calculatePPChange(user);
  const worker = new Worker(`${__dirname}/threadCalculator.js`, { workerData: user })
  const result = await pEvent(worker, 'message')

  // `emitter` emitted a `finish` event
  // console.log(result);

  // worker.on('message', m => m);
  return {
    name: user.name,
    id: user.id,
    now: result.now,
    derankingPP: result.derankingPP,
    derankingPPDelta: result.now - result.derankingPP,
    derankingPPPercentage: (result.now - result.derankingPP) / result.now,
    overrankingPP: result.overrankingPP,
    overrankingPPDelta: result.now - result.overrankingPP,
    overrankingPPPercentage: (result.now - result.overrankingPP) / result.now,
    timestamp: new Date().getTime()
  }
}
async function calcUser (user, forceUpdate = false) {
  try {
    if (typeof user !== 'object') user = he.decode(user)
    const getUserHandle = `https://o.ri.mk/api/pppolice/v1/getUser/${user}?fields[]=id&fields[]=name`
    user = await fetch(getUserHandle).then(res => res.json())
    if (user !== null && user.id !== undefined && user.name !== undefined) {
      try {
        if (forceUpdate) throw 'calc'
        const file = `${__dirname}/Datas/CalculatedResults/${user.id}.json`
        if (fsold.existsSync(file)) {
          // console.log('use cache:', user);
          const score = JSON.parse(await fs.readFile(file))
          return score
        } else throw 'calc'
      } catch (e) {
        if (e === 'calc') {
          const result = await calcUserFresh(user)
          fs.writeFile(`${__dirname}/Datas/CalculatedResults/${user.id}.json`, JSON.stringify(result))
          return result
        } else {
          console.log(e.stack)
        }
      }
    } else {
      // user = await fetch(`https://o.ri.mk/api/pppolice/v1/register/${user}`).then(res => res.json());
      // const forceUpdate = await fetch(`https://o.ri.mk/api/pppolice/v1/forceUpdate/${user}`).then(res => res.json());
      // if (forceUpdate) throw 'calc';
      // else console.log('what?',user)
      throw 'calc'
    }
  } catch (e) {
    if (e === 'calc') {
      if (await registerUser(user)) {
        await fetch(`https://o.ri.mk/api/pppolice/v1/forceUpdate/${user}`)
        const result = await calcUserFresh(user)
        fs.writeFile(`${__dirname}/Datas/CalculatedResults/${user.id}.json`, JSON.stringify(result))
        return result
      } else throw 'calc failed'
    } else {
      console.log(e.stack)
    }
  }
}
async function registerUser (user) {
  return await fetch(`https://o.ri.mk/api/pppolice/v1/register/${user}`).then(res => res.json())
}
async function readAllCachedUser () {
  try {
    const directoryPath = path.join(__dirname, 'Datas', 'CalculatedResults')
    const files = await glob(`${directoryPath}/*.json`)
    const cached = path.join(__dirname, 'Datas', 'CachedResults')
    const cachedResults = await glob(`${cached}/*.json`)
    if (files.length !== cachedResults.length) {
      const ids = [...files, ...cachedResults].map(file => path.basename(file, '.json')).filter((id) => id !== null && id !== 'undefined')
      return await Promise.all(ids.map(id => calcUser(id, true)))
    }
    const calculated = await Promise.all(files.map(async json => JSON.parse(await fs.readFile(json))))
    const needUpdate = calculated.filter(result => (new Date().getTime() - result.timestamp) > 24 * 60 * 60 * 1000)
    const good = calculated.filter(result => (new Date().getTime() - result.timestamp) <= 24 * 60 * 60 * 1000)
    const resultMix = await Promise.all(needUpdate.map(({ id }) => calcUser(id, true)))
    return [...good, ...resultMix]
  } catch (e) {
    console.log(e.stack)
  }
}
exports.Deranker = Deranker
exports.calcUser = calcUser
exports.readAllCachedUser = readAllCachedUser
