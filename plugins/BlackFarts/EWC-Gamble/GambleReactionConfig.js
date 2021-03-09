const fetch = require('node-fetch')
// const AbortController = require('abort-controller')

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
  session.$send('给对局起个名字')
  const name = await session.$prompt()
  session.$send(`介绍一下对局：${name}`)
  const description = await session.$prompt()
  session.$send('请提供出场队伍/队员，用换行区分')
  const member = await session.$prompt().then(res => res.split('\r').join('').split('\n'))

  session.$send([
      `对局: ${name}`,
      `介绍: ${description}`,
      `队伍: ${member.join(',')}`,
      '没问题嘛？发送“确认”提交对局'
  ].join('\n'))
  const confirm = await session.$prompt().then(res => res.trim() === '确认')
  console.log(confirm)
  if (!confirm) return
  let result = await createMatch({
    name,
    description,
    member,
    adder_qq: session.userId
  })
    .then(res => res.text())
    // .then(res => res.json())
  console.log(result)
  try {
    result = JSON.parse(result)
  } catch (error) {
    return session.$send(result)
  }

  if (result.message) session.$send(result.message)
  else session.$send(JSON.stringify(result))
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
    await meta.$send(`你可以下注给:\n${matched.member.map((t, index) => `  ${index + 1}: ${t}`).join('\n')}\n你可以提供序号或者名字`)
    target = await meta.$prompt()
    // eslint-disable-next-line eqeqeq
    if (parseInt(target) && !matched.member.find(m => m == target)) target = matched.member[target - 1]
    await meta.$send('下注金额')
    amount = await meta.$prompt()
  }
  await meta.$send([
      `对局: ${match}`,
      `下注: ${target}`,
      `数量: ${amount}`,
      '没问题嘛？发送“确认”提交'
  ].join('\n'))
  const confirm = await meta.$prompt().then(res => res.trim() === '确认')
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
  closebet: endMatch

}
