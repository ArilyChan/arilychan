const Base = require('./Base')
module.exports = class Reply extends Base {
  constructor (attr) {
    super(attr)
    this.type = 'quote'
  }

  id (id) {
    this.attrtibutes.id = id
    return this
  }
}
