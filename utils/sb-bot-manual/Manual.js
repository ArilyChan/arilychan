const Section = require('./Section.js')
const Base = require('./Base')
/**
 * Manual
 */
class Manual extends Base {
  constructor (manualMap) {
    super()
    this.entriesTitle = ''
    this.indentDescription = false
  }

  /**
     * return or create a section
     * @param {any} id
     * @returns {import './Section.js'} Section
     */
  section (id) {
    if (!this._entries.has(id)) { this._entries.set(id, new Section({ _id: id })) }
    return this._entries.get(id)
  }
}

module.exports = Manual
