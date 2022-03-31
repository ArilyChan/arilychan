const { Deranker, calcUser } = require('./common.js')
const [Score, Beatmap, Result] = ['Score', 'Beatmap', 'Result'].map(obj => require(`./Objects/${obj}.js`))
const { Worker, parentPort, workerData } = require('worker_threads')

async function calc () {
  const d = new Deranker()
  workerData.bp.map(score => {
    // score.__proto__ = Result.prototype;
    // result.beatmap.__proto__ = Beatmap.prototype;
    score.__proto__ = Score.prototype
    score.createModsArray()
  })
  parentPort.postMessage(await d.calculatePPChange(workerData))
}
calc()
