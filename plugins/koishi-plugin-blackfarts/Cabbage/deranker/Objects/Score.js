const memorize = require('memorize')
const Mods = {
  None: 0,
  NoFail: 1,
  Easy: 1 << 1,
  TouchDevice: 0,
  Hidden: 1 << 3,
  HardRock: 1 << 4,
  SuddenDeath: 1 << 5,
  DoubleTime: 1 << 6,
  Relax: 1 << 7,
  HalfTime: 1 << 8,
  Nightcore: 0, // DoubleTime mod
  Flashlight: 0,
  Autoplay: 0,
  SpunOut: 0,
  Relax2: 0, // Autopilot
  Perfect: 0, // SuddenDeath mod
  FreeModAllowed: 0,
  ScoreIncreaseMods: 0
}

const realMods = {
  None: 0,
  NoFail: 1,
  Easy: 1 << 1,
  TouchDevice: 1 << 2,
  Hidden: 1 << 3,
  HardRock: 1 << 4,
  SuddenDeath: 1 << 5,
  DoubleTime: 1 << 6,
  Relax: 1 << 7,
  HalfTime: 1 << 8,
  Nightcore: 1 << 9, // DoubleTime mod
  Flashlight: 1 << 10,
  Autoplay: 1 << 11,
  SpunOut: 1 << 12,
  Relax2: 1 << 13, // Autopilot
  Perfect: 1 << 14, // SuddenDeath mod
  Key4: 1 << 15,
  Key5: 1 << 16,
  Key6: 1 << 17,
  Key7: 1 << 18,
  Key8: 1 << 19,
  FadeIn: 1 << 20,
  Random: 1 << 21,
  Cinema: 1 << 22,
  Target: 1 << 23,
  Key9: 1 << 24,
  KeyCoop: 1 << 25,
  Key1: 1 << 26,
  Key3: 1 << 27,
  Key2: 1 << 28,
  KeyMod: 521109504,
  FreeModAllowed: 522171579,
  ScoreIncreaseMods: 1049662
}
const fs = require('fs')
const overrank = JSON.parse(fs.readFileSync(`${__dirname}/../Datas/overrank.json`)).sort((a, b) => b.x * b.adj - a.x * a.adj)
const maxAdj = Math.max(...overrank.map(map => map.adj))
const max = Math.max(...overrank.map(map => map.x))
// console.log(maxAdj);
// overrank = overrank.slice(0,Math.round(overrank.length * 0.8));

// console.log(overrank[0]);
// console.log(overrank.filter(map => map.b === 1969946));

function Score () {}
Score.prototype.isDeranking = function () {
  return this.withSO() || (this.withNF() && ['XS', 'XH', 'SH', 'S', 'A', 'B'].includes(this.rank) && this.acc() >= 0.89)
}
Score.prototype.withNF = function () { return this._mods.includes('NoFail') }
Score.prototype.withSO = function () { return this._mods.includes('SpunOut') }
Score.prototype.shortMods = function () {
  const shortMods = { Easy: 'EZ', NoFail: 'NF', HalfTime: 'HT', HardRock: 'HR', SuddenDeath: 'SD', DoubleTime: 'DT', Nightcore: 'NC', Hidden: 'HD', Flashlight: 'FL', SpawnOut: 'SO' }
  let mods = this._mods.filter(s => s !== 'FreeModAllowed')
  if (mods.some(s => s === 'Nightcore')) { mods = mods.filter(s => s !== 'DoubleTime') }
  mods = mods.map(mod => shortMods[mod])
  return mods
}
Score.prototype.rawMods = function () {
  return this._mods.reduce((acc, cur) => {
    // console.log(cur,Mods[cur])
    return (Mods[cur] !== undefined) ? acc + Mods[cur] : cur
  }, 0)
}
Score.prototype.createModsArray = function () {
  if (this._mods !== undefined) { return this._mods }

  this._mods = []
  for (const mod in Mods) {
    if (this.raw_mods & Mods[mod]) { this._mods.push(mod) }
  }

  return this._mods
}
Score.prototype.getOverWeightPercentage = function () {
  // console.log(this.rawMods(),this._mods);
  const e = overrank.find(map => map.b === this.beatmapId && map.m === this.rawMods())
  if (e !== undefined) {
    return +e.x / Math.pow(e.adj || 1, 0.65) / Math.pow(+e.h || 1, 0.35)
  } else {
    return 0
  }
}
Score.prototype.acc = function () {
  count300 = parseInt(this.counts[300])
  count100 = parseInt(this.counts[100])
  count50 = parseInt(this.counts[50])
  countmiss = parseInt(this.counts.miss)
  return (count300 * 300 + count100 * 100 + count50 * 50 + countmiss * 0) / ((count300 + count100 + count50 + countmiss) * 300)
}
module.exports = Score
