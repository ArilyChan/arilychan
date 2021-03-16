const URL = require('url').URL;
const Base = require('./Base')
module.exports = class Record extends Base{
  constructor(attr){
    super(attr)
    this.type = 'record'
  }
  
  file(file){
    this.attrtibutes.title = title
    return this
  }

  url(url){
    this.attrtibutes.url = url
    return this
  }

  testRequiredFields(){
    if (!this.attrtibutes.file && !this.attrtibutes.url) throw new Error('need file or url')
    if (this.attrtibutes.file) return true
    try {
      new URL(this.attrtibutes.url)
    } catch (error) {
      throw new Error('url invalid')
    }
  }
}