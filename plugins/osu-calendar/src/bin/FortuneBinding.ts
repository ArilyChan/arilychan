import Activity from './Activity'
import Fortune from './Fortune'

// eslint-disable-next-line no-unmodified-loop-condition, no-var
const getDaysArray = function (s: ConstructorParameters<typeof Date>[0], e: Date) { for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)) } return a }

class FortuneBinding {
  me: string
  fortune: any

  constructor (me: string, fortune: Fortune) {
    this.me = me
    this.fortune = fortune
  }

  when (date: ConstructorParameters<typeof Date>[0]) {
    date = new Date(date) // de-bind the date from
    date.setUTCHours(0, 0, 0, 0)
    return new Activity(this.me, this.fortune.events, date)
  }

  get today () {
    return this.when(new Date())
  }

  from (from: ConstructorParameters<typeof Date>[0]) {
    from = new Date(from) // de-bind the date from
    from.setUTCHours(0, 0, 0, 0)
    const self = this
    return new (class FortuneBindingPeriodCursor {
      to (to: ConstructorParameters<typeof Date>[0]) {
        to = new Date(to)
        to.setUTCHours(0, 0, 0, 0)
        return getDaysArray(from, to).map(date => self.when(date))
      }
    })()
  }
}

export default FortuneBinding
