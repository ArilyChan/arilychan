const connection = require('./database')

class storage {
  constructor (options = {}) {
    this.options = options
    this.cache = []
    this.initdb()
    // this.maxEntries = options.maxEntries || 10384
    this.inited = false
  }

  async initdb () {
    const db = await connection(this.options)
    this.messages = db.collection('messages')
    this.events = db.collection('events')
    this.notices = db.collection('notices')
    this.requests = db.collection('requests')
    this.inited = true
  }

  copy (meta) {
    return JSON.parse(JSON.stringify(meta))
  }

  record (meta) {
    switch (meta.postType) {
      case 'message': {
        // this.messages.set(meta.contentId, meta)
        // if (this.messages.size > this.maxEntries) {
        //   Array.from(this.messages.keys())
        //     .slice(0, 100)
        //     .map(key => this.messages.delete(key))
        // }
        this.cache.push({
          meta,
          timeout: setTimeout(() => {
            const self = this.cache.findIndex(op => op.meta.contentId === meta.contentId)
            this.cache.splice(self, 1)
            if (!this.inited) return
            this.messages.insertOne(this.copy(meta))
            // meta.send(`inserted ${meta.contentId}`)
          }, 1000)
        })
        // meta.send(`schedule insert message ${meta.contentId} 1000ms later`)
        break
      }
      case 'notice':
      case 'request':
        break
      case 'meta_event':
        break
      default:
        console.warn('unknown type')
    }
  }

  delete (meta) {
    switch (meta.postType) {
      case 'message': {
        // meta.send(`cancelling insertion of ${meta.contentId}`)
        const index = this.cache.findIndex(op => op.meta.contentId === meta.contentId)
        if (index !== -1) {
          const cache = this.cache[index]
          clearTimeout(cache.timeout)
          this.cache.splice(index, 1)
          // meta.send(`canceled the schedule of insertion ${meta.contentId}`)
        } else {
          if (!this.inited) return
          this.messages.deleteOne({
            messageId: meta.contentId,
            time: meta.time
          })
          // meta.send(`chain took too long, remove from db ${meta.contentId}`)
        }

        break
      }
      case 'notice':
      case 'request':
        break
      case 'meta_event':
        break
      default:
        console.warn('unknown type')
    }
  }
}

module.exports = storage
