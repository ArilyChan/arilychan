const managers = ['onebot:879724291']
const blackFartsEnabled = [
  940857703, // pr
  879724291,
  2606793420, // White
  630060047, // CYCLC
  976685185, // lsahi
  387820244, // crystal
  2227385902 // Miracle
].map(id => `onebot:${id}`)
const enabled = {
  say: [
    'onebnot:2038548858',
    'telegram:535116380',
    '535116380'
  ]
}

exports.isManager = function (qq) {
  return managers.includes(qq)
}
exports.blackFartTo = function (qq) {
  return blackFartsEnabled.includes(qq)
}
exports.isEnabled = function (action, qq) {
  console.log(qq)
  return enabled[action].includes(qq) || false
}
