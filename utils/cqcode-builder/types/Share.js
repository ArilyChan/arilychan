const URL = require('url').URL;
const Base = require('./Base')
module.exports = class Share extends Base{
  constructor(attr){
    super(attr)
    this.type = 'share'
  }
  
  title(title){
    this.attrtibutes.title = title
    return this
  }

  url(url){
    this.attrtibutes.url = url
    return this
  }

  testRequiredFields(){
    if (!this.attrtibutes.title) throw new Error('need titles')
    try {
      new URL(this.attrtibutes.url)
    } catch (error) {
      throw new Error('url invalid')
    }
  }
}