
function Beatmap () {}
Beatmap.prototype.madeBy = function (mapper) {
  return this.creator === mapper || this.version.toLowerCase().includes(mapper.toLowerCase())
}
Beatmap.prototype.is = function (mapper) {
  return this.source.toLowerCase().includes(mapper.toLowerCase()) || this.title.toLowerCase().includes(mapper.toLowerCase())
}
Beatmap.prototype.byShitMapper = function () {
  return (
    this.madeBy('Sotarks') ||
        this.madeBy('Awaken') ||
        this.madeBy('Fiery') || this.madeBy('fieryrage') ||
        this.madeBy('Natsu') ||
        this.madeBy('VINXIS') ||
        this.madeBy('Fatfan Kolek') ||
        this.madeBy('Log Off Now') ||
        this.madeBy('A r M i N') ||
        this.madeBy('Reform') ||
        this.madeBy('Taeyang') ||
        this.madeBy('Lami') ||
        this.madeBy('Monstrata') ||
        this.madeBy('Kyuukai') ||
        this.madeBy('-Keitaro') ||
        this.madeBy('Nevo') ||
        this.madeBy('momochikun') ||
        this.madeBy('doyak') ||
        this.madeBy('seni') ||
        this.madeBy('miraclee') ||
        this.madeBy('momoka')
  )
}
Beatmap.prototype.isShitMap = function () {
  return (
    this.is('chika chika') ||
        this.is('hidamari no uta') ||
        this.is('oneroom') ||
        this.is('harumachi clover') ||
        this.is('natsuzora yell') ||
        this.is('koi no hime hime') ||
        this.is('best friends') ||
        this.is('Kani*Do-Luck!') ||
        this.is('yuki no hana') ||
        this.is('kira kira days') ||
        this.is('kimi no bouken')
  )
}

Beatmap.prototype.toString = function () {
  return `${this.artist} - ${this.title} [${this.version}] (${this.creator})`
}

module.exports = Beatmap
