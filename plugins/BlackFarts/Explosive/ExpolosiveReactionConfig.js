const fetch = require('node-fetch')
// const AbortController = require('abort-controller')
const he = require('he')
const { getOsuApi, addPlus, timeoutSignal } = require('../utils/utils')
const { URLSearchParams } = require('url')

const prompt = require('sb-prompt-filter')

const CQCode = require('cqcode-builder')
// const moment = require('moment');
// const osu = require('node-osu');
// const Beatmap = require("./node-osu/lib/base/Beatmap");
// const User = require("./node-osu/lib/base/User");
// const Score = require("./node-osu/lib/base/Score");

// const addUser = require('./deranker/addUser');
// const DerankerBase64Table = require('./deranker/Base64Table');
// const Matchmaking = require("./Matchmaking/Matchmaking")
// const createEWCPlayer = require("./Matchmaking/Player");
// const { Matchmaking, createPlayer: createEWCPlayer, Api: EWCMatchmakingApi } = require("ewc-matchmaking");
const EApi = require('ewc-api')
const E = new EApi()
// const match = new Matchmaking();
// const matchapi = new EWCMatchmakingApi('http://localhost:11451');
// const { startsWith } = require('lodash');
// const Recipe = require('../views/components/recipe');

const tips = {
  NullMatchName: '!!使用比赛房间作为比赛名称。这通常会出问题。比赛格式示例：EloWeeklyCup Season0 1400-1800。'
}
const usage = {
  anotherelo: '【叹号】anotherelo <osu用户名或id>',
  'elo.upload': '【叹号】elo.upload <mp id> [比赛名]:格式示例: EloWeeklyCup Season0 1400-1800。',
  sendMatchResult: '【叹号】elo.result <MatchId>',
  // '排': `【叹号】(排, join) <osu用户名或id> `,
  // '找打': `【叹号】(找打, rival, rivals) `,
  // '不打了': `【叹号】(不打了, drop, quit) `,
  // joinTeam: `【叹号】(team.join, jointeam) <osu用户名或id>#<队伍名>`,
  // quitTeam: `【叹号】(team.quit, quitteam) <osu用户名或id>#<队伍名>`,
  // registerTeam: `【叹号】(team.create, createteam) <队伍名>`,
  dad: '【叹号】(dad, dad_of) <osu用户名或id>'
  // findTeam: `【叹号】(team.find, findteam) <队伍名>`,
  // findTeamsByRank: `【叹号】(team.findbyrank, findteamsbyrank, findteambyrank) <分段>`,
}

class NullUserError extends Error {
  constructor (handle) {
    super(`没有找到用户。 (User: ${handle})`) // (1)
    this.name = 'NullUserError' // (2)
  }
}
class NullMatchError extends Error {
  constructor (matchID) {
    super(`没有找到这场比赛。(MatchID: ${matchID})`) // (1)
    this.name = 'NullMatchError' // (2)
  }
}
class NeedHelps extends Error {
  constructor () {
    super() // (1)
    this.name = 'NeedHelps' // (2)
  }
}
// class UserNotInMatchmakingError extends Error {
//     constructor() {
//         super('你不在匹配中。!排 <osu用户名或id> 将自己添加进匹配中。'); // (1)
//         this.name = "UserNotInMatchmakingError"; // (2)
//     }
// }
// class UserDuplicateError extends Error {
//     constructor() {
//         super('你重复加入匹配。发送!不打了 删除目前存在的匹配后重新开始。'); // (1)
//         this.name = "UserDuplicateError"; // (2)
//     }
// }
// class TeamNameInvalidError extends Error {
//     constructor(teamName) {
//         super(`队伍名包含禁止字符。(name: ${teamName})`); // (1)
//         this.name = "TeamNameInvalidError"; // (2)
//     }
// }
async function getUserByHandle (handle) {
  const osuApi = getOsuApi()
  try {
    return osuApi.getUser({ u: handle })
  } catch (Error) {
    if (Error.message === 'User not found') throw new NullUserError(handle)
    else throw Error('API broken...')
  }
}
// const playOrNot = async ({ command, meta, app}) => {
//     const logger = app.logger('CabbageReaction');
//     meta.$send(`${Math.round(Math.random()) ? '打' : '不打'}`).catch(e => console.error.bind(console))
// }
const uploadElo = async ({ command, meta, app }) => {
  // const logger = app.logger('CabbageReaction');
  const message = []
  if (meta.messageType !== 'private') message.push(new CQCode.At().qq(meta.userId))
  try {
    if (command[1] === undefined || command[1] === '') throw new NeedHelps()
    const matchID = command[1]
    let matchName = command.slice(2).join(' ').trim()

    const osuApi = getOsuApi()
    const match = await osuApi.apiCall('/get_match', { mp: matchID })

    if (match.match === 0) throw new NullMatchError(matchID)
    if (matchName === '') {
      message.push(tips.NullMatchName)
      matchName = match.match.name
    }

    const params = new URLSearchParams()
    params.append('match_id', matchID)
    params.append('tourney_name', matchName)

    const response = await E.matchesPost({ body: params })
    setImmediate(async (response, meta) => {
      if (response.code === 10001) {
        const updateResult = await E.matches.calculateElo({ signal: timeoutSignal(20) })
        meta.$send(`${new CQCode.At().qq(meta.userId)} ${updateResult.message}`).catch(e => console.error.bind(console))
        const message = []
        if (meta.messageType !== 'private') message.push(new CQCode.At().qq(meta.userId))
        try {
          message.push(await (await getMatchEloChangeWithOsuUser(matchID)).toString())
          await meta.$send(message.join('\n'))
        } catch (Error) {
          console.error(Error)
        }
      }
    }, response, meta)
    message.push(response.message)
  } catch (Error) {
    const append = handleErrorMessage(Error, 'elo.upload') || ''
    message.push(append)
    console.error(Error)
  } finally {
    meta.$send(message.join('\n')).catch(e => console.error.bind(console))
  }
}
// const findRival = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let search = await matchapi.getPlayer({ handle: `qq.${meta.userId}` });
//         if (search.length <= 0) throw new UserNotInMatchmakingError();
//         else if (search.length > 1) throw new UserDuplicateError();
//         let all = await matchapi.getSuitable({ handle: `qq.${meta.userId}` });
//         if (all.length > 0) {
//             let str = all.map(player => {
//                     return {
//                         id: player.id,
//                         name: player.name,
//                         joinedAt: moment(player.createdAt).fromNow(),
//                         handle: player.handle,
//                         elo: player.elo,
//                     }
//                 })
//                 .map(player => {
//                     return `${player.name} https://osu.ppy.sh/users/${player.id} :
//     joined ${player.joinedAt}
//     contact: ${player.handle.startsWith('qq.') ? 'QQ: ' +player.handle.slice(3) : "来自其他平台。稍后支持" }
//     elo: ${player.elo}`
//                 })
//                 .join("\n")
//             message.push(str);
//         } else {
//             message.push(`当前无符合ELO赛条件的匹配中玩家。`);
//         }

//         // .fromNow();
//     } catch (Error) {
//         let append = handleErrorMessage(Error, '找打') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const listPlayers = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         // let all = match.list();
//         let all = await matchapi.getAll();
//         if (all.length > 0) {
//             let str = all.map(player => {
//                     return {
//                         id: player.id,
//                         name: player.name,
//                         joinedAt: moment(player.createdAt).fromNow(),
//                         handle: player.handle,
//                         elo: player.elo,
//                     }
//                 })
//                 .map(player => {
//                     return `${player.name} https://osu.ppy.sh/users/${player.id} :
//     joined ${player.joinedAt}
//     contact: ${player.handle.startsWith('qq.') ? 'QQ: ' +player.handle.slice(3) : "来自其他平台。稍后支持" }
//     elo: ${player.elo}`
//                 })
//                 .join("\n")
//             message.push(str);
//         } else {
//             message.push(`没人打。`);
//         }

//     } catch (Error) {
//         let append = handleErrorMessage(Error, '有谁打') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const joinMatch = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         // let search = match.findByHandle(`qq.${meta.userId}`);
//         let search = await matchapi.getPlayer({ handle: `qq.${meta.userId}` });
//         if (search.length > 0) throw new UserDuplicateError();
//         if (command[1] === undefined || command[1] === '') throw new NeedHelps();
//         let handle = command.slice(1).join(" ").trim();
//         handle = he.decode(handle)
//         let osuApi = getOsuApi();

//         let user;
//         try {
//             user = await osuApi.getUser({ u: handle });
//         } catch (error) {
//             if (error.message === 'Not found') throw new NullUserError(handle);
//             else throw new Error('API broken...');
//         }
//         user.handle = `qq.${meta.userId}`;
//         user.u = user.id;
//         // let player = await createEWCPlayer(user);
//         // let result = match.putIn(player);
//         let player = await matchapi.putPlayer(user)
//         message.push(`已经将您添加进匹配。\n发送！找打寻找符合比赛条件条件同样在匹配中的玩家。\n您的匹配将会在6小时后超时并被取消。`);
//         if (player.fob) message.push('这是初始elo！！请尽快参赛获得正式elo');

//     } catch (Error) {
//         let append = handleErrorMessage(Error, '排') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const quitMatch = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let search = await matchapi.getPlayer({ handle: `qq.${meta.userId}` });
//         if (search.length > 0) {
//             search.map(player => {
//                 matchapi.deletePlayer(player);
//             })
//             message.push(`已经将您从匹配中删除。`)
//         } else {
//             message.push(`您不在匹配中。`)
//             throw new NeedHelps();
//         }

//     } catch (Error) {
//         let append = handleErrorMessage(Error, '不打了') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const joinTeam = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let userTeam = command.slice(1).join(" ").trim();
//         let [user, ...team] = userTeam.split('#');
//         team = team.join("#").trim();
//         if (team === '' || user === '') throw new NeedHelps();
//         if (team.includes(';')) throw new TeamNameInvalidError(team);
//         user = he.decode(user)
//         user = await getUserByHandle(user);
//         const params = new URLSearchParams();
//         params.append('user_id', user.id);
//         params.append('team_name', team);

//         let response = await E.ewc.join({ body: params });
//         message.push(response.message);

//     } catch (Error) {
//         let append = handleErrorMessage(Error, 'joinTeam') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const quitTeam = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let userTeam = command.slice(1).join(" ").trim();
//         let [user, ...team] = userTeam.split('#');
//         team = team.join("#").trim();
//         if (team === '' || user === '') throw new NeedHelps();
//         if (team.includes(';')) throw new TeamNameInvalidError(team);
//         user = he.decode(user)
//         user = await getUserByHandle(user);
//         const params = new URLSearchParams();
//         params.append('user_id', user.id);
//         params.append('team_name', team);

//         let response = await E.ewc.quit({ body: params });
//         message.push(response.message);

//     } catch (Error) {
//         let append = handleErrorMessage(Error, 'quitTeam') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const registerTeam = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let team = command.slice(1).join(" ").trim();
//         if (team === '') throw new NeedHelps();
//         // let [user, ...team] = userTeam.split('#');
//         // team = team.join("#");
//         if (team.includes(';')) throw new TeamNameInvalidError(team);
//         // user = he.decode(user)
//         // user = await getUserByHandle(user);
//         const params = new URLSearchParams();
//         // params.append('user_id', user.id);
//         params.append('team_name', team);
//         params.append('qq', meta.userId);

//         let response = await E.ewc.register({ body: params });
//         message.push(response.message);

//     } catch (Error) {
//         let append = handleErrorMessage(Error, 'registerTeam') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const findTeam = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let team = command.slice(1).join(" ").trim();
//         if (team === '') throw new NeedHelps();
//         if (team.includes(';')) throw new TeamNameInvalidError(team);

//         let response = await E.ewc.getTeam(team);

//         response.member = await Promise.all(response.member.map(id => getUserByHandle(id)));
//         message.push(`队伍平均elo: ${response.avg_elo}
// 队伍人数: ${response.size}
// 段位: ${response.rank}
// 成员: `);
//         response.member.map(member =>
//             message.push(`    ${member.name}:https://osu.ppy.sh/users/${member.id}`)
//         )

//     } catch (Error) {
//         let append = handleErrorMessage(Error, 'findTeam') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
// const findTeamsByRank = async function({ command, meta, app}) {
//     const logger = app.logger('CabbageReaction');
//     let message = [];
//     if (meta.messageType !== 'private') message.push(`[CQ:at,qq=${meta.userId}]`);
//     try {
//         let team = command.slice(1).join(" ").trim();
//         if (team === '') throw new NeedHelps();
//         if (team.includes(';')) throw new TeamNameInvalidError(team);

//         let response = await E.ewc.getTeamRank(team);
//         message.push(`${team}段位队伍列表`)
//         response.map(team => message.push(`    ${team.team_name}: ${team.avg_elo}`));

//     } catch (Error) {
//         let append = handleErrorMessage(Error, 'findTeamsByRank') || '';
//         message.push(append);
//         logger.warn(Error);
//     } finally {
//         meta.$send(message.join("\n"));
//     }
// }
const dad = async function ({ command, meta, app }) {
  // const logger = app.logger('CabbageReaction')
  const message = []
  if (meta.messageType !== 'private') message.push(new CQCode.At().qq(meta.userId))
  try {
    let user = command.slice(1).join(' ').trim()
    user = he.decode(user)
    user = await getUserByHandle(user)

    const response = await E.users.dad(user.id)
    // logger.warn(response);
    if (response.message) throw response.message
    message.push(`你一共被爆锤${response.count}次,`)
    try {
      const dad = await getUserByHandle(response.dad)
      message.push(`最爱你的爸爸是${dad.name}，爱过你${response.dad_times}次。`)
    } catch (e) {
      message.push(`最爱你的爸爸爱过你${response.dad_times}次，但是他号没了。他的uid是${response.dad}。`)
    }
  } catch (Error) {
    const append = handleErrorMessage(Error, 'dad') || ''
    message.push(append)
    console.warn(Error)
  } finally {
    meta.$send(message.join('\n')).catch(e => console.error.bind(console))
  }
}

async function getMatchEloChangeWithOsuUser (matchId) {
  const match = await E.matches(matchId)
  if (Object.entries(match.elo_change).length === 0) throw new Error('Match不存在或未上传')
  const result = await Promise.all(Object.entries(match.elo_change).map(async ([id, eloChange]) => {
    return Object.assign(await getUserByHandle(id), { eloChange })
  }))
  return {
    toArray: async function () {
      const message = []
      try {
        message.push(`mplink: https://osu.ppy.sh/community/matches/${matchId}`)
        message.push(`otsu: http://otsu.fun/matches/${matchId}`)
        message.push('elo变动:')
        message.push(...this.result.map(user => `    ${user.name}: ${addPlus(user.eloChange)}`))
      } catch (Error) {
        console.log(Error)
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return message
      }
    },
    toString: async function () {
      return (await this.toArray()).join('\n')
    },
    result
  }
}
async function sendMatchResult ({ meta, command }) {
  const message = []
  if (meta.messageType !== 'private') message.push(new CQCode.At().qq(meta.userId))
  try {
    const matchId = command[1]
    if (!(matchId >>> 0 === parseFloat(matchId))) throw new NeedHelps()
    message.push(await (await getMatchEloChangeWithOsuUser(matchId)).toString())
  } catch (Error) {
    const append = handleErrorMessage(Error, 'sendMatchResult') || ''
    message.push(append)
    console.log(Error)
  } finally {
    meta.$send(message.join('\n')).catch(e => console.error.bind(console))
  }
}

function handleErrorMessage (Error, from) {
  if (typeof Error === 'string') return Error
  if (Error.name === 'NeedHelps') return `Usage: ${usage[from] || '未添加使用说明'}`
  else if (Error.name === 'AbortError') return '请求花费了太长时间。请重试。'
  else return `${Error.message} \nUsage: ${usage[from] || '未添加使用说明'}`
}

const elo = async ({ command, meta, app }) => {
  try {
    const handle = command.slice(1).join(' ')
    if (handle === '') throw new NeedHelps() //         let osuApi = getOsuApi();

    let user
    try {
      user = user = await getUserByHandle(he.decode(handle))
    } catch (error) {
      console.log(error)
      if (error.message === 'Not found') throw new NullUserError(handle)
      else throw Error('API broken...')
    }

    const userId = user.id

    const [
      elo,
      recentPlay
    ] = await Promise.all([
      E.users.elo(userId, { signal: timeoutSignal(20) }),
      E.users.recentPlay(userId, { signal: timeoutSignal(20) })
    ])
    // let recentMatch = await E.matches(recentPlay.match_id, { signal: timeoutSignal(20) }).catch(err => {
    //     return {
    //         damage: [{
    //             user_id: -1,
    //             username: 'someone',
    //         }]
    //     }
    // })

    const res = Object.assign(user, elo, recentPlay /* { recentMatch } */)

    await meta.$send(`${new CQCode.At().qq(meta.userId)} \n${await eloTable(res)}`)
  } catch (Error) {
    const append = handleErrorMessage(Error, 'elo')
    meta.$send(`${new CQCode.At().qq(meta.userId)} ${append}`).catch(e => console.error.bind(console))
  }
}
const gamblingApiBase = 'http://47.101.168.165:5002'
const createMatch = (data) => {
  const url = `${gamblingApiBase}/match`
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
const matchList = () => {
  const url = `${gamblingApiBase}/match`
  return fetch(url).then(res => res.json())
}
const bet = ({ id }, data) => {
  const url = `${gamblingApiBase}/match/${id}/bet`
  console.log(url, data)
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
const settleBet = ({ id }, data) => {
  const url = `${gamblingApiBase}/match/${id}/finished`
  console.log(url, data)
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
const createBet = async ({ command, meta: session, app }) => {
  try {
    session.$send('给对局起个名字。发送“取消”可以中止。')
    const name = await prompt({
      source: () => session.$prompt(),
      filter: res => res.length,
      rejectFilter: rej => rej.trim() === '取消',
      maxRetries: 2
    })
    session.$send(`介绍一下对局：${name}。发送“取消”可以中止。`)
    const description = await prompt({
      source: () => session.$prompt(),
      filter: res => res.length,
      rejectFilter: rej => rej.trim() === '取消',
      maxRetries: 2
    })
    session.$send('请提供出场队伍/队员，用换行区分。发送“取消”可以中止。')
    const member = await prompt({
      source: () => session.$prompt(),
      onRetry: (message, reason) => {
        if (message) session.$send(`${message} 不符合要求。\n${reason || '换一个答案'}`)
      },
      filter: res => {
        if (res.split('\n').length > 1) return '至少要有两个人。'
      },
      rejectFilter: rej => rej.trim() === '取消',
      maxRetries: 3
    })
      .then(res => res.split('\r').join('').split('\n'))

    session.$send([
      `对局: ${name}`,
      `介绍: ${description}`,
      `队伍: ${member.join(',')}`,
      '没问题嘛？发送“确认”提交对局。发送“取消”可以中止。'
    ].join('\n'))
    const confirm = await prompt({
      source: () => session.$prompt(),
      filter: res => res.trim() === '确认',
      rejectFilter: rej => rej.trim() === '取消',
      maxRetries: 10
    })
    console.log(confirm)
    if (!confirm) return session.$send('请重试。')
    let result = await createMatch({
      name,
      description,
      member,
      adder_qq: session.userId
    })
      .then(res => res.text())
    try {
      // .then(res => res.json())
      console.log(result)
      result = JSON.parse(result)
    } catch (error) {
      return session.$send(result)
    }

    if (result.message) session.$send(result.message)
    else session.$send(JSON.stringify(result))
  } catch (error) {
  }
}

const betOnMatch = async ({ command, meta, app }) => {
  let match, target, amount, matched
  if (command.length >= 4) {
    [, match, target, amount] = command
    const matches = await matchList()
    matched = matches.find(m => m.name === match)
    if (!matched) return meta.$send('没有找到这个对局。（小阿日没找到）')
  } else {
    await meta.$send('对局名？')
    match = await meta.$prompt()
    const matches = await matchList()
    matched = matches.find(m => m.name === match)
    if (!matched) return meta.$send('没有找到这个对局。（小阿日没找到）')
    await meta.$send(`你可以支持:\n${matched.member.map((t, index) => `  ${index + 1}: ${t}`).join('\n')}\n你可以提供序号或者名字`)
    target = await meta.$prompt()
    // eslint-disable-next-line eqeqeq
    if (parseInt(target) && !matched.member.find(m => m == target)) target = matched.member[target - 1]
    await meta.$send('支持多少？')
    amount = await meta.$prompt()
  }
  await meta.$send([
      `对局: ${match}`,
      `下注: ${target}`,
      `数量: ${amount}`,
      '没问题嘛？发送“确认”提交'
  ].join('\n'))
  const confirm = await prompt({
    source: () => meta.$prompt(),
    filter: res => res.trim() === '确认',
    rejectFilter: rej => rej.trim() === '取消',
    maxRetries: 10
  }).catch(() => { meta.$send('操作已经取消') }) // confirm = undefined
  if (!confirm) return
  const result = await bet(matched, {
    qq: meta.userId,
    amount,
    target
  }).then(res => res.json())
  if (result.message) return meta.$send(result.message)
  else meta.$send(JSON.stringify(result))
}

const endMatch = async ({ command, meta, app }) => {
  let match, winner, matched
  if (command.length >= 4) {
    [, match, winner] = command
    const matches = await matchList()
    matched = matches.find(m => m.name === match)
    if (!matched) return meta.$send('没有找到这个对局。（小阿日没找到）')
  } else {
    await meta.$send('对局名？')
    match = await meta.$prompt()
    const matches = await matchList()
    matched = matches.find(m => m.name === match)
    if (!matched) return meta.$send('没有找到这个对局。（小阿日没找到）')
    await meta.$send(`赢方？你可以宣布:\n${matched.member.map((t, index) => `  ${index + 1}: ${t}`).join('\n')}\n你可以提供序号或者名字`)
    winner = await meta.$prompt()
    // eslint-disable-next-line eqeqeq
    if (parseInt(winner) && !matched.member.find(m => m == winner)) winner = matched.member[winner - 1]
  }
  await meta.$send([
      `将被清算的对局: ${match}`,
      `胜方: ${winner}`,
      '没问题嘛？发送“确认”提交'
  ].join('\n'))
  const confirm = await meta.$prompt().then(res => res.trim() === '确认')
  if (!confirm) return
  const result = await settleBet(matched, {
    qq: meta.userId,
    winner
  }).then(res => res.json())
  if (result.message) return meta.$send(result.message)
  else meta.$send(JSON.stringify(result))
}

module.exports = {
  gamble: createBet,
  bet: betOnMatch,
  closebet: endMatch,
  anotherelo: elo,
  'elo.upload': uploadElo,
  'elo.result': sendMatchResult,
  'mapp.upload': ({ command, meta, app }) => {
    const base = (pool) => `http://47.101.168.165:5004/mappool/${pool}/maps_uploader`
    const pool = command.slice(1).join(' ').trim()
    // const poolName = command[1]
    const qq = meta.userId
    const data = pool.split('\n').map(line => line.split('=')).reduce((acc, cur) => {
      acc[cur[0]] = cur[1]
      return acc
    }, {})
    data.uploader_qq = qq
    meta.$send('order:' + JSON.stringify(data)).catch(e => console.error.bind(console))
    if (!data.mappool_name) return meta.$send('mappool_name unspecified').catch(e => console.error.bind(console))
    fetch(base(data.mappool_name), {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then(res => res.text())
      .then(text => meta.$send(text))
      .catch(err => meta.$send(err))
  },
  // '找打': findRival,
  // rival: findRival,
  // rivals: findRival,
  // '有谁打': listPlayers,
  // '有誰打': listPlayers,
  // list: listPlayers,
  // '排': joinMatch,
  // join: joinMatch,
  // '不打了': quitMatch,
  // quit: quitMatch,
  // drop: quitMatch,
  // 'team.join': joinTeam,
  // jointeam: joinTeam,
  // 'team.quit': quitTeam,
  // quitteam: quitTeam,
  // 'team.create': registerTeam,
  // createteam: registerTeam,
  // 'team.find': findTeam,
  // findteam: findTeam,
  // 'team.findbyrank': findTeamsByRank,
  // findteamsbyrank: findTeamsByRank,
  // findteambyrank: findTeamsByRank,
  dad: dad,
  dad_of: dad
  // policeadd: async ({ command, meta, app}) => meta.$send(await addUser(command.slice(1).join(' ')).then(_ => 'added')),
  // forceupdate: async ({ command, meta, app}) => meta.$send(await addUser(command.slice(1).join(' '), true).then(_ => 'updated').catch(e => Promise.resolve(e.toString()))),
  // deranker: async ({ command, meta, app}) => meta.$send(`[CQ:image,file=base64://${await DerankerBase64Table()}]`),
  // policeexists: async ({ command, meta, app}) => {
  //    const result = await fetch(`https://o.ri.mk/api/pppolice/v1/localUserExists/${command.slice(1).join(' ')}`).then(res => res.json())
  //    meta.$send(result.toString());
  // },
}

// eslint-disable-next-line no-unused-vars
// function getMatchPlayers (match) {
//   return match.damage
// }

// function getMatchPlayersExclude(user, match) {

//     return getMatchPlayers(match).filter(player => {
//         return user.id != player.user_id
//     });
// }

async function recentMatchName (matchID) {
  return (await getOsuApi().apiCall('/get_match', { mp: matchID })).match.name
}

async function eloTable (user) {
  // against ${getMatchPlayersExclude(user,user.recentMatch).map(player => player.username).join(" , ")}
  return `${user.name}
ELO: ${user.elo} [ ${addPlus(user.elo_change)} in ${await recentMatchName(user.match_id)} ]
Initial ELO: ${user.init_elo}
MP Id: ${user.match_id}`
}
