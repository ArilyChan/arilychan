const Activity = require('./Activity')
class Fortune {
  constructor (events = {}) {
    this.events = events
  }

  binding (who) {
    return new FortuneBinding(who, this)
  }
}

class FortuneBinding {
  constructor (me, fortune) {
    this.me = me
    this.fortune = fortune
  }

  when (date) {
    date = new Date(date) // de-bind the date from
    date.setUTCHours(0, 0, 0, 0)
    return new Activity(this.me, this.fortune.events, date)
  }

  get today () {
    return this.when(new Date())
  }

  from (from) {
    // eslint-disable-next-line no-unmodified-loop-condition
    const getDaysArray = function (s, e) { for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)) } return a }
    from = new Date(from) // de-bind the date from
    from.setUTCHours(0, 0, 0, 0)
    const self = this
    return new (class FortuneBindingPeriodCursor {
      to (to) {
        to = new Date(to)
        to.setUTCHours(0, 0, 0, 0)
        return getDaysArray(from, to).map(date => self.when(date))
      }
    })()
  }
}

module.exports = { Fortune, FortuneBinding }
