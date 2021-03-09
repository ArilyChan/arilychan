const CQ = require('cqcode-builder')
const StatusMe = require('./StatusMe')
const config = require('./cabbageReactionUser')

const usage = {
  anotherelo: '❗️anotherelo <osu用户名或id>',
  'elo.upload': '❗️elo.upload <mp id> [比赛名]:格式示例: EloWeeklyCup Season0 1400-1800。',
  sendMatchResult: '❗️elo.result <MatchId>',
  // '排': `【叹号】(排, join) <osu用户名或id> `,
  // '找打': `【叹号】(找打, rival, rivals) `,
  // '不打了': `【叹号】(不打了, drop, quit) `,
  // joinTeam: `【叹号】(team.join, jointeam) <osu用户名或id>#<队伍名>`,
  // quitTeam: `【叹号】(team.quit, quitteam) <osu用户名或id>#<队伍名>`,
  // registerTeam: `【叹号】(team.create, createteam) <队伍名>`,
  dad: '❗️(dad, dad_of) <osu用户名或id>',
  // findTeam: `【叹号】(team.find, findteam) <队伍名>`,
  // findTeamsByRank: `【叹号】(team.findbyrank, findteamsbyrank, findteambyrank) <分段>`,
  say: '❗️say <...something>',
  吃啥: '❗️吃啥 [菜单] [特殊需求]',
  吃点刺激的: '❗️吃点刺激的 [菜单] [特殊需求]',
  加个菜: '❗️加个菜 <菜单> <菜名> (换行)[中人的图片]',
  倒: '❗️倒 <菜单> <菜名>',
  'menu.marknsfw': '❗️menu.marknsfw <菜单>',
  'recipe.marknsfw': '❗️recipe.marknsfw <菜单> <菜名>',
  'menu.marksfw': '❗️menu.marksfw <菜单>',
  'recipe.marksfw': '❗️recipe.marksfw <菜单> <菜名>'
}
const desc = {
  anotherelo: '查询elo',
  'elo.upload': '上传成绩给爆炸',
  sendMatchResult: '查询比赛结果',
  排: '加入匹配 ',
  找打: '寻找合适的对手 ',
  不打了: '退出匹配 ',
  joinTeam: '参加队伍',
  quitTeam: '退出已参加的队伍',
  registerTeam: '创建（新）队伍',
  dad: '找爸爸',
  findTeam: '找队伍',
  findTeamsByRank: '按照分段搜索队伍',
  say: '代理发言',
  'menu.marknsfw': '标记菜单为nsfw',
  'recipe.marknsfw': '标记料理为nsfw',
  'menu.marksfw': '取消菜单的nsfw标记',
  'recipe.marksfw': '取消料理的nsfw标记'
}
const mute = () => undefined
const blackfart = ({ meta, app }) => {
  // const logger = app.logger('CabbageReaction');
  if (config.blackFartTo(meta.userId)) {
    setTimeout(() => meta.$send(`${meta.sender.nickname}牛逼`).catch(e => console.error.bind(console)), 1000 * 5)
  }
}

function helps ({ meta, app }) {
  const helpcontents = Object.entries(usage).map(([name, usage]) => `${usage}: ${(desc[name] !== undefined) ? desc[name] : '未添加命令说明'}`)
  meta.$send(helpcontents.join('\n')).catch(e => console.error.bind(console))
}

function poke ({ command, meta, app }) {
  const qq = command.slice(1).join(' ').trim()
  const cqcode = `${new CQ.Poke().qq(qq)}`
  meta.$send(cqcode).catch(e => console.error.bind(console))
}
module.exports = {
  help: helps,
  sleep: '昨天不是刚睡过吗？怎么又要睡',
  wakeup: '早',
  早: '早',
  status: StatusMe,
  me: blackfart,
  search: mute,
  bp: mute,
  bpme: blackfart,
  pr: blackfart,
  recent: blackfart,
  stat: mute,
  statme: blackfart,
  poke,
  say: async ({ command, meta, app }) => {
    const message = command.slice(1).join(' ').trim()
    if (config.isManager(meta.userId)) meta.$send(message).catch(e => console.error.bind(console))
    else if (config.isEnabled('say', meta.userId)) meta.$send(`${meta.sender.nickname}: ${message}`).catch(e => console.error.bind(console))
  }
}
