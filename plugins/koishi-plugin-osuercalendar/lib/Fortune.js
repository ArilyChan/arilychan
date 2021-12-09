const FortuneBinding = require('./FortuneBinding')
class Fortune {
  constructor (events = {}) {
    this.events = events
  }

  binding (who) {
    return new FortuneBinding(who, this)
  }
}

module.exports = Fortune
