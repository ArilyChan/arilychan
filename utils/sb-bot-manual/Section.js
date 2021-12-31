const Base = require('./Base')
class Section extends Base {
  constructor ({ _id } = {}) {
    super()
    this._id = _id
    // this.entriesTitle = '项目：'
    this.entriesTitle = ''
    delete this._usages
  }
}
module.exports = Section
