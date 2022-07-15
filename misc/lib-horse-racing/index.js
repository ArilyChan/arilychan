const FLOAT = 100
const assignId = (self, id = Math.random()) => {
  self._id = id
  return id
}
const state = {
  pool: 0,
  commission: 0.01,
  horses: new Map(),
  balance: new Map(),
  matches: new Map(),
  gamblers: new Map(),
  // 最大允许杠杆倍数
  leverage: 4,
  // 无条件借贷额度
  credit: 100 * FLOAT,
  // 平仓线（风险率）
  liquidate: 0,
  float: FLOAT,
  lending: 0
}

const models = {
  gambler: {
    id: 879724291,
    // 总入金
    deposits: 0,
    // 总出金
    withdraw: 0,
    // 账号余额
    balance: 0,
    // 未实现损益
    unrealizedGain: 0,
    // 借贷
    collateral: 0,
    // 风险率
    get margin() {
      const net = this.net + state.credit
      const overBorrow = net * state.leverage / this.collateral < state.liquidate
      return overBorrow ? Infinity : this.collateral / net / state.leverage
    },
    get net() {
      return this.balance + this.unrealizedGain - this.collateral
    },
    history: []
  },
  horse: {
    get id() {
      return this._id || assignId(this)
    },
    name: '',
    get seed() { return Math.random() }
  },
  pool: {
    get id() {
      return this._id || assignId(this)
    },
    get odds() {
      return new Map([...this.balance.entries()].map(([horseId, balance]) => {
        const ratio = (balance && this.totalBalance / balance * (1 - state.commission)) || 0
        return [horseId, ratio]
      }))
    },
    bets: [],
    balance: new Map(),
    totalBalance: 0,
    settled: false,
    type: 'single',
    match: undefined
  },
  bet: {
    bettorId: undefined,
    horseId: undefined,
    amount: 0
  },
  match: {
    get id() {
      return this._id || assignId(this)
    },
    horses: [],
    result: [],
    finished: false,
    pools: []
  }
}

function initHorses() {
  [1, 2, 3, 4, 5, 6, 7, 8]
    .map(id => ({ _id: id, name: `horse-${id}` }))
    .map(horse => state.horses.set(horse._id, Object.assign(Object.create(models.horse), horse)))
}

function createGambler(id, deposit = undefined) {
  const gambler = Object.assign(Object.create(models.gambler), { id, balance: deposit ?? 0, deposit, withdraw: 0 })
  gambler.history = []
  state.gamblers.set(id, gambler)
  return gambler
}

function createMatch(horseIds = []) {
  const match = Object.assign(Object.create(models.match), {})
  match.pools = []
  match.horses = horseIds.map(id => state.horses.get(id)).filter(_ => _)
  return match
}

// 下注时资金不变，未实现余额为负。
function createPool(match, poolName,
  // 结算函数 返回Map<bettorId, delta> 只结算收益，未实现损益由赌场负责结算
  resolveFunc = (match, pool, gamblers) => {
    if (!match.finished) return new Map()
    const wonHorse = match.result?.[0]
    if (!wonHorse) {
      return pool.bets.reduce((acc, cur) => {
        if (!acc.get(cur.bettorId)) acc.set(cur.bettorId, 0)
        acc.set(cur.bettorId, acc.get(cur.bettorId) + cur.amount)
      }, new Map())
    }
    const singleWinner = pool.bets.filter(bet => bet.horseId === wonHorse?.id)
    const ratio = pool.odds.get(wonHorse.id)
    const pay = singleWinner.reduce((acc, cur) => {
      if (!acc.get(cur.bettorId)) acc.set(cur.bettorId, 0)

      acc.set(cur.bettorId, Math.floor(cur.amount * ratio))
      return acc
    }, new Map())
    return pay
  }) {
  const pool = Object.assign(Object.create(models.pool), {})
  pool.name = poolName
  pool.bets = []
  pool.balance = new Map()
  pool.settle = resolveFunc
  pool.match = match
  match.pools.push(pool)
  return pool
}
function lend (bettorId, lending) {
  const gambler = state.gamblers.get(bettorId)
  gambler.collateral += lending
  state.lending += lending
  if (gambler.margin > 1) {
    // console.log('over-betting', bettorId, {
    //   lending: lending / state.float,
    //   margin: gambler.margin
    // })
    gambler.collateral -= lending
    state.lending -= lending
    return {
      stat: false,
      reason: 'over-betting'
    }
  }
  gambler.balance += lending
  return {
    stat: true
  }
}

function bet(pool, bettorId, amount, horseId) {
  const gambler = state.gamblers.get(bettorId)
  const lending = amount - gambler.balance
  if (lending > 0) {
    const result = lend(bettorId, lending)
    if (!result.stat) return result
  }
  gambler.unrealizedGain -= amount
  pool.bets.push({ bettorId, amount, horseId })
  gambler.history.push({ bettorId, amount, horseId })
  pool.balance.set(horseId, (pool.balance.get(horseId) || 0) + amount)
  pool.totalBalance += amount
  return {
    stat: true
  }
}

function* createResult(match, step) {
  let current = 0
  const result = match.horses.map(horse => ({ id: horse.id, result: Math.random() / 2 + 0.5 }))
  const resultMin = Math.min(...result.map(r => r.result))

  const horseResult = new Map(result.map(horse => [horse.id, horse.result / resultMin]))
  const horseProgress = new Map(match.horses.map(horse => [horse.id, 0]))
  const rtnResult = []
  yield horseProgress
  while (current <= step) {
    [...horseProgress.entries()].map(([horseId, progress]) => {
      const target = horseResult.get(horseId)
      // const distance = target - progress
      if (progress > 1 && !rtnResult.find(r => r.id === horseId)) return rtnResult.push({ id: horseId, time: current / step })
      if (step - current === 1) horseProgress.set(horseId, target)
      else horseProgress.set(horseId, progress + (Math.random() * 2.1 * target / step))
    })
    yield horseProgress
    current += 1
  }
  match.result = rtnResult
  match.finished = true
  return horseProgress
}

function settleMatch(match) {
  const result = createResult(match, 50)
  let current = result.next()
  while (!current.done) {
    // console.log('比赛进行中', current.value)
    current = result.next()
  }
  match.pools.map(settlePool)
  match.pools = []
}

function settlePool(pool) {
  const payment = pool.settle(pool.match, pool, state.gamblers)
  let totalPayment = 0
    ;[...payment.entries()].map(([bettorId, amount]) => {
      console.log(bettorId)
      const gambler = state.gamblers.get(bettorId)
      // pay debt first
      if (gambler.collateral > 0) {
        const amountReturn = Math.min(gambler.collateral, amount)
        amount -= amountReturn
        gambler.unrealizedGain += amountReturn
        gambler.collateral -= amountReturn
        state.lending -= amountReturn
      }

      gambler.balance += amount

      totalPayment += amount
    })
  pool.bets.map(({ bettorId, amount }) => {
    const gambler = state.gamblers.get(bettorId)
    gambler.balance -= amount
    gambler.unrealizedGain += amount
  })
  state.pool += pool.totalBalance - totalPayment
  pool.settled = true
}

initHorses()
// console.log(state.horses)
// console.log(match, pool)

createGambler(1, 100 * 100)
createGambler(2, 10000 * 100)
createGambler(3, 10000 * 100)
createGambler(4, 100000 * 100)
function logBalance() {
  // console.log([...state.gamblers.values()].map(gambler => {
  //   return [`id: ${gambler.id}`, `入金-出金: ${(gambler.deposit - gambler.withdraw) / state.float}`, `资金: ${gambler.balance / state.float}`, `未实现盈亏: ${gambler.unrealizedGain / state.float}`, `借贷:${gambler.collateral / state.float}`, `借贷风险率:${gambler.margin}`].join('\n\t')
  // }).join('\n'))
  console.table([...state.gamblers.values()].map(({ id, balance, net, unrealizedGain, collateral, margin }) => ({
    id,
    balance: balance / state.float,
    net: net / state.float,
    unrealizedGain: unrealizedGain / state.float,
    collateral: collateral / state.float,
    margin
  })))
}
function round(params) {
  const match = createMatch([1, 2, 3, 4])
  const pool = createPool(match, `${new Date().toUTCString()}-单胜`)
  bet(pool, 1, Math.floor(Math.random() * 10000), Math.round(Math.random() * 3) + 1)
  bet(pool, 2, Math.floor(Math.random() * 10000), Math.round(Math.random() * 3) + 1)
  bet(pool, 3, Math.floor(Math.random() * 10000), Math.round(Math.random() * 3) + 1)
  bet(pool, 4, Math.floor(Math.random() * 20000), Math.round(Math.random() * 3) + 1)
  console.log('======')
  console.log('池', pool.name)
  console.log('总赌注', pool.totalBalance / state.float)
  console.log('下注', pool.balance)
  console.log('赔率', pool.odds)
  console.log('-----')
  console.log('下注情况', pool.bets)

  settleMatch(match)
  console.log('-----')
  console.log('比赛结果', match.result)
  console.log('-----')
  console.log('赌狗资金')
  logBalance()
  console.log('-----')
  console.log('主办资金', state.pool / state.float, '借贷', -state.lending / state.float)
}
round()
round()
round()
round()
round()
round()
round()
round()
round()
round()
round()
round()
console.log('1号的赌博')
console.table(state.gamblers.get(1).history, ['amount', 'horseId'])

module.exports = {
  state,
  models,
  initHorses,
  createGambler,
  createMatch,
  createPool,
  bet,
  settleMatch
}
