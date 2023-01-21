import FortuneBinding from './FortuneBinding'
class Fortune {
  events: Record<string, any>
  constructor (events = {}) {
    this.events = events
  }

  binding (who) {
    return new FortuneBinding(who, this)
  }
}

export default Fortune
