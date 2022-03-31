function Result () {

}

Result.prototype.isDeranking = function () {
  return this.withSO() || (this.withNF() && ['XS', 'XH', 'SH', 'S', 'A', 'B'].includes(this.newScore.rank))
}
Result.prototype.withNF = function () {
  return this.mods.includes('NoFail')
}
Result.prototype.withSO = function () {
  return this.mods.includes('SpunOut')
}
Result.prototype.roundPP = function () {
  this.pp = +(Math.round(this.pp + 'e+2') + 'e-2')
}

module.exports = Result
