const Base = require('./Base')
class Entry extends Base {
  constructor ({ _id }) {
    super()
    this._id = _id
    this.entriesTitle = ''
  }
}
module.exports = Entry
