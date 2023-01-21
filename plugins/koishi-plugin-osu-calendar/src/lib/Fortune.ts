import { OsuCalendarEvents } from '../types/store'
import FortuneBinding from './FortuneBinding'
class Fortune {
  events: Record<string, any>
  constructor (events: OsuCalendarEvents) {
    this.events = events
  }

  binding (who) {
    return new FortuneBinding(who, this)
  }
}

export default Fortune
