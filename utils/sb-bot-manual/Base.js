class Base {
  constructor () {
    this._description = undefined
    this._usages = []
    this._detail = undefined
    this._name = undefined
    this._id = undefined
    this._entries = new Map()
    this.entriesTitle = 'items:'
    this.indentDescription = true
    this._tags = []
  }

  name (name) {
    this._name = name
    return this
  }

  /**
   * save desc
   * @param {String} description
   */
  description (explain) {
    this._description = explain
    return this
  }

  /**
   * save usage
   * @param {String} usage
   */
  usage (explain) {
    this._usages.push(explain)
    return this
  }

  /**
   * save desc
   * @param {String} detail
   */
  detail (explain) {
    this._detail = explain
    return this
  }

  /**
     * return or create a entry
     * @param {any} id
     */
  entry (id) {
    const Entry = require('./Entry')
    if (!this._entries.has(id)) { this._entries.set(id, new Entry({ _id: id })) }
    return this._entries.get(id)
  }

  /**
   *
   * @param {String} tag
   */
  tag (tag) {
    this._tags.push(tag)
    return this
  }

  renderAsString ({ indent, list, newLine, command } = { indent: '  ', list: '- ', newLine: '\n', command: '> ' }) {
    const v = { i: 0 }
    const i = () => [...Array(v.i)].map(_ => indent).join('')
    const l = () => list
    const c = () => command

    const result = []
    if (this._name) result.push(i() + this._name)
    else if (this._id) result.push(i() + this._id)
    if (this.indentDescription) v.i += 1
    if (this._description) result.push(i() + this._description)
    if (this._detail) result.push(i() + this._detail)
    // if (!this._name && !this._description && !this._detail && !this._id) result.push(i())
    if (this.entriesTitle) result.push(i() + this.entriesTitle)
    v.i += 1
    if (this._usages) result.push(...this._usages.map(u => i() + c() + u))
    result.push(...[...this._entries.values()].map(
      entry => i() + l() + entry.renderAsString().split(newLine).join(newLine + i())
    ))

    return result.join(newLine)
  }

  filter (keyword) {
    keyword = keyword.trim()
    if (!keyword) return

    // search titles
    let hit = [this._id, this._name, this._description, this._detail].some(v => v?.includes?.(keyword))
    if (hit) {
      const rtn = Object.create(this)
      rtn.reason = 'self-includes-keyword'
      return rtn
    }

    // search tags
    hit = this._tags?.some?.(v => v.includes?.(keyword))
    if (hit) {
      const rtn = Object.create(this)
      rtn.reason = 'tag-includes-keyword'
      return rtn
    }

    // search usages
    hit = this._usages?.some?.(v => v.includes?.(keyword))
    if (hit) {
      const rtn = Object.create(this)
      rtn.reason = 'usage-includes-keyword'
      return rtn
    }

    // search entries
    const hits = [...this._entries.entries()].filter(([id, entry]) => entry.filter(keyword))
    if (!hits.length) return
    const rtn = Object.create(this)
    rtn.reason = 'entry-includes-keyword'
    rtn._entries = new Map(hits)
    return rtn
  }
}
module.exports = Base
